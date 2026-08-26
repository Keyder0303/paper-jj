-- Schema Idempotente para Paper Puente Pro en Supabase
-- Proyecto Supabase ID: czzvsqnmxtjzqzioknnn

create table if not exists public.jjp_categories (
    id serial primary key,
    name varchar(100) not null,
    slug varchar(100) unique not null,
    created_at timestamp default now()
);

create table if not exists public.jjp_products (
    id serial primary key,
    sku varchar(50) unique not null,
    name varchar(255) not null,
    description text,
    category_id int references public.jjp_categories(id),
    unit_price numeric(10,2) not null default 0.00,
    cost_price numeric(10,2) not null default 0.00,
    image_url text,
    created_at timestamp default now()
);

create table if not exists public.jjp_inventory (
    id serial primary key,
    product_id int references public.jjp_products(id) on delete cascade,
    warehouse_stock int not null default 0,
    store_stock int not null default 0,
    min_stock int not null default 10,
    updated_at timestamp default now()
);

create table if not exists public.jjp_zones (
    id serial primary key,
    name varchar(100) not null,
    code varchar(50) unique not null,
    assigned_seller varchar(100) not null -- 'Yovanni' o 'Adriana'
);

create table if not exists public.jjp_customers (
    id serial primary key,
    name varchar(255) not null,
    business_name varchar(255),
    phone varchar(50) not null,
    email varchar(255),
    address text,
    zone_id int references public.jjp_zones(id),
    created_at timestamp default now()
);

create table if not exists public.jjp_orders (
    id serial primary key,
    customer_id int references public.jjp_customers(id),
    seller varchar(100) not null,
    total_amount numeric(10,2) not null,
    status varchar(50) default 'pending', -- pending, paid, shipped, delivered, cancelled
    created_at timestamp default now()
);

create table if not exists public.jjp_order_items (
    id serial primary key,
    order_id int references public.jjp_orders(id) on delete cascade,
    product_id int references public.jjp_products(id),
    quantity int not null,
    unit_price numeric(10,2) not null
);

create table if not exists public.jjp_wa_messages (
    id serial primary key,
    phone varchar(50) not null,
    message text not null,
    direction varchar(20) not null, -- inbound, outbound
    status varchar(50) default 'sent',
    created_at timestamp default now()
);

create table if not exists public.jjp_server_control (
    id int primary key,
    status varchar(50) not null,
    updated_at timestamp default now()
);

-- Políticas RLS opcionales o habilitación básica
alter table public.jjp_products enable row level security;
alter table public.jjp_inventory enable row level security;
alter table public.jjp_customers enable row level security;
alter table public.jjp_zones enable row level security;

create policy "Public read products" on public.jjp_products for select using (true);
create policy "Public read inventory" on public.jjp_inventory for select using (true);
create policy "Public read zones" on public.jjp_zones for select using (true);
create policy "Public read customers" on public.jjp_customers for select using (true);
