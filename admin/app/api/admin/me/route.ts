import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get admin user details
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        icNumber: true,
        role: true,
      }
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(adminUser);

  } catch (error) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { icNumber, fullName, phoneNumber } = body;

    // Update admin user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(icNumber && { icNumber }),
        ...(fullName && { fullName }),
        ...(phoneNumber && { phoneNumber }),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        icNumber: true,
        role: true,
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
