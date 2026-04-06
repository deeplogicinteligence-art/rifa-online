import Link from 'next/link'
import { Ticket, Zap, Shield, Trophy, ArrowRight, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: 68,
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 1.5rem',
          height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ticket size={22} style={{ color: 'var(--accent-light)' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>RifaOnline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Entrar</Link>
            <Link href="/cadastro" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Criar conta</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', textAlign: 'center',
        padding: '0 1.5rem',
        paddingTop: 68,
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', opacity: 0.15, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative' }} className="animate-fade-in-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 9999, fontSize: '0.875rem', marginBottom: '2rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--accent-light)' }}>
            <Zap size={15} /> Sorteio automático via Loteria Federal
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontFamily: 'Syne, sans-serif', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Crie rifas online<br />
            <span className="glow-text">em minutos</span>
          </h1>

          <p style={{ fontSize: '1.125rem', maxWidth: 520, margin: '0 auto 2.5rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Configure sua rifa, compartilhe o link e gerencie tudo pelo painel.
            O sorteio acontece automaticamente pela Loteria Federal.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/cadastro" className="btn-primary animate-pulse-glow" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Criar minha rifa <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem' }}>Tudo que você precisa</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3.5rem' }}>Do cadastro ao sorteio, sem complicação</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: <Ticket size={28} />, title: 'Crie em minutos', desc: 'Configure foto, valor, quantidade de números e data do sorteio. Seu link fica pronto na hora.' },
              { icon: <Shield size={28} />, title: 'Pagamento transparente', desc: 'Exiba sua chave Pix para os participantes. Confirme os pagamentos pelo painel com um clique.' },
              { icon: <Trophy size={28} />, title: 'Sorteio automático', desc: 'O sistema consulta a Loteria Federal na data marcada e notifica todos os participantes por e-mail.' },
            ].map((f, i) => (
              <div key={i} className="card">
                <div style={{ width: 52, height: 52, borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: 'rgba(124,58,237,0.15)', color: 'var(--accent-light)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '0.625rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section style={{ padding: '6rem 1.5rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Syne, sans-serif', fontWeight: 800, textAlign: 'center', marginBottom: '3.5rem' }}>Como funciona</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[
              { n: '01', title: 'Crie sua conta', desc: 'Cadastro rápido com validação de CPF para garantir segurança.' },
              { n: '02', title: 'Configure a rifa', desc: 'Foto do produto, valor por número (25, 50, 100, 200 ou 500 números), data do sorteio e chave Pix.' },
              { n: '03', title: 'Compartilhe o link', desc: 'Envie para o WhatsApp, Instagram ou onde quiser. Qualquer pessoa acessa sem precisar criar conta.' },
              { n: '04', title: 'Gerencie pagamentos', desc: 'Veja no painel quem reservou e confirme os pagamentos recebidos via Pix.' },
              { n: '05', title: 'Sorteio automático', desc: 'Na data marcada, o sistema busca o resultado da Loteria Federal e notifica todos por e-mail.' },
            ].map((step) => (
              <div key={step.n} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '2rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, color: 'var(--accent)', opacity: 0.4, flexShrink: 0, lineHeight: 1 }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, fontFamily: 'Syne, sans-serif', marginBottom: '0.375rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, marginBottom: '1rem' }}>Pronto para começar?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Crie sua primeira rifa agora — é gratuito.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {['Sem mensalidade', 'Link compartilhável', 'Sorteio automático'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={15} style={{ color: 'var(--success)' }} />{item}
              </div>
            ))}
          </div>
          <Link href="/cadastro" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
            Criar minha rifa grátis <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Ticket size={16} style={{ color: 'var(--accent-light)' }} />
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>RifaOnline</span>
        </div>
        <p>© {new Date().getFullYear()} RifaOnline · Todos os direitos reservados</p>
      </footer>
    </main>
  )
}
