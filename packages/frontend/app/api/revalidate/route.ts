import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  revalidatePath('/', 'page')
  revalidatePath('/empreendimentos', 'page')
  revalidatePath('/empreendimentos/[slug]', 'page')
  return NextResponse.json({ revalidated: true })
}
