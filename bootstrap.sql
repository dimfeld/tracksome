begin;

create table users (
  user_id bigint primary key generated always as identity,
  name text not null,
  email text,
  avatar text,
  enabled boolean not null default true,
  created timestamptz not null default now(),
  updated timestamptz not null default now()
);

create table logins (
  login_id text not null,
  provider text not null,
  secret_hash text,
  enabled boolean not null default true,
  user_id bigint not null references users,
  primary key (login_id, provider)
);

create table sessions (
  session_id uuid primary key not null default gen_random_uuid(),
  user_id bigint references users,
  created timestamptz not null default now(),
  expires timestamptz
);

create table trackables (
  trackable_id bigint primary key generated always as identity,
  user_id bigint not null references users,
  name text not null,
  enabled boolean not null default true,
  multiple_per_day boolean not null default false,
  sort int not null default 0,
  color text not null,

  unique (trackable_id, user_id)
);

create table trackable_attributes (
  trackable_attribute_id bigint primary key generated always as identity,
  trackable_id bigint not null,
  user_id bigint not null references users,
  enabled boolean not null default true,
  sort int not null default 0,
  name text,

  required boolean not null default true,
  attribute_type text,
  constraints jsonb,

  unique (trackable_attribute_id, user_id),
  foreign key (trackable_id, user_id) references trackables (trackable_id, user_id)
);

create index on trackable_attributes(user_id);
create index on trackable_attributes(trackable_id);

create table trackable_attribute_categories (
  trackable_attribute_category_id bigint primary key generated always as identity,
  trackable_attribute_id bigint not null,
  user_id bigint not null references users,
  enabled boolean not null default true,
  name text not null,
  color text not null,

  unique (trackable_attribute_category_id, trackable_attribute_id, user_id),
  foreign key (trackable_attribute_id, user_id) references trackable_attributes (trackable_attribute_id, user_id)
);

create index on trackable_attribute_categories(user_id);
create index on trackable_attribute_categories(trackable_attribute_id);

create table items (
  item_id bigint primary key generated always as identity,
  trackable_id bigint not null references trackables,
  user_id bigint not null references users,
  time timestamptz not null,
  note text,
  added timestamptz default now(),
  modified timestamptz default now(),

  unique (item_id, user_id),
  foreign key (trackable_id, user_id) references trackables (trackable_id, user_id)
);

create index on items(user_id, time, trackable_id);

create table item_attribute_values (
  item_attribute_value_id bigint generated always as identity,
  item_id bigint not null,
  trackable_attribute_id bigint not null references trackable_attributes,
  user_id bigint not null references users,

  numeric_value double precision,
  trackable_attribute_category_id bigint,
  note text,

  unique (item_attribute_value_id, user_id),
  foreign key (item_id, user_id) references items (item_id, user_id),
  foreign key (trackable_attribute_id, trackable_attribute_category_id, user_id) references trackable_attribute_categories (trackable_attribute_id, trackable_attribute_category_id, user_id)
);

create index on item_attribute_values(user_id);
create index on item_attribute_values(item_id);
create index on item_attribute_values(trackable_attribute_id);

commit;
