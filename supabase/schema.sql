-- =============================================
-- RIFA APP - Supabase Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (criadores de rifa)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  email text not null,
  telefone text,
  cpf text unique not null,
  cpf_validado boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuário vê seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza seu próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuário insere seu próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- =============================================
-- RIFAS
-- =============================================
create type rifa_status as enum ('rascunho', 'ativa', 'encerrada', 'cancelada', 'sorteada');
create type rifa_politica_incompleta as enum ('cancelar', 'sortear', 'transferir');

create table public.rifas (
  id uuid default uuid_generate_v4() primary key,
  criador_id uuid references public.profiles(id) on delete cascade not null,
  titulo text not null,
  descricao text,
  observacoes text,
  foto_url text,
  valor_numero decimal(10,2) not null,
  quantidade_numeros int not null check (quantidade_numeros in (25, 50, 100, 200, 500)),
  chave_pix text not null,
  data_limite_pagamento date not null,
  data_sorteio date not null,
  politica_incompleta rifa_politica_incompleta not null,
  status rifa_status default 'ativa',
  slug text unique not null,
  numero_ganhador int,
  participante_ganhador_id uuid,
  resultado_loteria text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.rifas enable row level security;

-- Qualquer um pode ver rifas ativas
create policy "Rifas ativas são públicas"
  on public.rifas for select
  using (status != 'rascunho' or criador_id = auth.uid());

-- Somente criador pode inserir
create policy "Criador insere rifa"
  on public.rifas for insert
  with check (auth.uid() = criador_id);

-- Somente criador pode atualizar
create policy "Criador atualiza rifa"
  on public.rifas for update
  using (auth.uid() = criador_id);

-- =============================================
-- PARTICIPANTES
-- =============================================
create table public.participantes (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  telefone text not null,
  email text not null,
  created_at timestamptz default now()
);

alter table public.participantes enable row level security;

create policy "Participantes são inseríveis por todos"
  on public.participantes for insert
  with check (true);

create policy "Criador vê participantes das suas rifas"
  on public.participantes for select
  using (
    exists (
      select 1 from public.numeros n
      join public.rifas r on r.id = n.rifa_id
      where n.participante_id = participantes.id
      and r.criador_id = auth.uid()
    )
  );

-- =============================================
-- NÚMEROS
-- =============================================
create type numero_status as enum ('disponivel', 'reservado', 'pago');

create table public.numeros (
  id uuid default uuid_generate_v4() primary key,
  rifa_id uuid references public.rifas(id) on delete cascade not null,
  numero int not null,
  status numero_status default 'disponivel',
  participante_id uuid references public.participantes(id),
  reservado_em timestamptz,
  pago_em timestamptz,
  expira_em timestamptz,
  created_at timestamptz default now(),
  unique(rifa_id, numero)
);

alter table public.numeros enable row level security;

create policy "Números são públicos para leitura"
  on public.numeros for select
  using (true);

create policy "Números podem ser reservados por qualquer um"
  on public.numeros for update
  using (status = 'disponivel');

create policy "Criador confirma pagamento"
  on public.numeros for update
  using (
    exists (
      select 1 from public.rifas r
      where r.id = numeros.rifa_id
      and r.criador_id = auth.uid()
    )
  );

create policy "Sistema insere números"
  on public.numeros for insert
  with check (true);

-- =============================================
-- FUNÇÃO: Gerar números ao criar rifa
-- =============================================
create or replace function public.gerar_numeros_rifa()
returns trigger as $$
declare
  i int;
begin
  for i in 1..new.quantidade_numeros loop
    insert into public.numeros (rifa_id, numero, status)
    values (new.id, i, 'disponivel');
  end loop;
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_gerar_numeros
  after insert on public.rifas
  for each row execute function public.gerar_numeros_rifa();

-- =============================================
-- FUNÇÃO: Expirar reservas após 48h
-- =============================================
create or replace function public.expirar_reservas()
returns void as $$
begin
  update public.numeros
  set
    status = 'disponivel',
    participante_id = null,
    reservado_em = null,
    expira_em = null
  where
    status = 'reservado'
    and expira_em < now();
end;
$$ language plpgsql security definer;

-- =============================================
-- STORAGE: Bucket para fotos das rifas
-- =============================================
insert into storage.buckets (id, name, public) values ('rifas', 'rifas', true)
on conflict do nothing;

create policy "Fotos de rifas são públicas"
  on storage.objects for select
  using (bucket_id = 'rifas');

create policy "Criador faz upload de foto"
  on storage.objects for insert
  with check (bucket_id = 'rifas' and auth.uid() is not null);
