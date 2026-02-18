import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';

type UserUpdate = Database['public']['Tables']['users']['Update'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { subscription_status, blocked, role } = body;

    const supabase = createAdminClient();
    
    const updateData: UserUpdate = { updated_at: new Date().toISOString() };
    
    if (subscription_status !== undefined) {
      updateData.subscription_status = subscription_status;
      if (subscription_status === 'premium') {
        updateData.subscription_start = new Date().toISOString();
        updateData.subscription_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }
    
    if (blocked !== undefined) {
      updateData.blocked = blocked;
    }
    
    if (role !== undefined) {
      updateData.role = role;
    }

    const { error } = await supabase
      .from('users')
      // @ts-ignore - Supabase generics inference issue with update()
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
