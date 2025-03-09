import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

// Mock user data for demonstration
const mockUsers = [
  {
    id: '6dfddf3b-45be-47db-be16-59226ea6353f',
    username: 'user1',
    email: 'user1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'ADMIN',
    createdAt: '2025-03-01T06:59:13.439026Z',
    active: true,
    avatar: '/images/avatars/1.png'
  },
  {
    id: '7e5d8f2a-31c9-42db-af16-82337ea9452e',
    username: 'user2',
    email: 'user2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'USER',
    createdAt: '2025-03-01T07:15:22.123456Z',
    active: true,
    avatar: '/images/avatars/2.png'
  },
  {
    id: '9a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d',
    username: 'user3',
    email: 'user3@example.com',
    firstName: 'Robert',
    lastName: 'Johnson',
    role: 'MANAGER',
    createdAt: '2025-03-01T08:30:45.987654Z',
    active: false,
    avatar: '/images/avatars/3.png'
  },
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    username: 'user4',
    email: 'user4@example.com',
    firstName: 'Emily',
    lastName: 'Williams',
    role: 'USER',
    createdAt: '2025-03-01T09:45:30.246810Z',
    active: true,
    avatar: '/images/avatars/4.png'
  },
  {
    id: '2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    username: 'user5',
    email: 'user5@example.com',
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'ADMIN',
    createdAt: '2025-03-01T10:20:15.135792Z',
    active: false,
    avatar: '/images/avatars/5.png'
  }
];

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    console.log('Session in API route:', session ? 'Session exists' : 'No session');
    if (session) {
      console.log('User in session:', session.user?.name);
      console.log('User role:', session.user?.role);
    }
    
    // For development purposes, we'll allow access without authentication
    // In production, you would want to uncomment this check
    /*
    if (!session) {
      console.log('No session found, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    */

    console.log('Returning mock users data');
    // In a real application, you would fetch users from a database
    // For now, we'll return mock data
    return NextResponse.json(mockUsers);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to create users.' },
        { status: 403 }
      );
    }

    // Parse request body
    const userData = await req.json();
    
    // Validate user data (basic validation)
    if (!userData.username || !userData.email || !userData.firstName || !userData.lastName || !userData.role) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // In a real application, you would save the user to a database
    // For now, we'll just return a success response with mock data
    return NextResponse.json({
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
      active: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to create user. Please try again later.' },
      { status: 500 }
    );
  }
}
