import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { openDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const db = await openDb();

    // Verifica se o usuário já existe
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário com este email já existe' },
        { status: 409 }
      );
    }

    // Faz o hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insere o novo usuário
    await db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    return NextResponse.json(
      { message: 'Usuário registrado com sucesso' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
