import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { openDb } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_testing';

export async function GET(request) {
  try {
    // Busca o header de autorização
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido ou formato inválido' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verifica o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const db = await openDb();
    
    // Busca o usuário no banco, garantindo que o token ainda é válido para uma conta existente
    const user = await db.get('SELECT id, email FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Rota protegida acessada com sucesso', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify Token Error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
