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

create table trackable_numeric_attributes (
  trackable_numeric_attribute_id bigint primary key generated always as identity,
  trackable_id bigint not null,
  user_id bigint not null references users,
  enabled boolean not null default true,
  sort int not null default 0,
  name text,

  required boolean not null default true,
  min_value double precision,
  max_value double precision,
  step double precision,

  unique (trackable_numeric_attribute_id, user_id),
  foreign key (trackable_id, user_id) references trackables (trackable_id, user_id)
);

create index on trackable_numeric_attributes(user_id);
create index on trackable_numeric_attributes(trackable_id);

create table trackable_category_attributes (
  trackable_category_attribute_id bigint primary key generated always as identity,
  trackable_id bigint not null,
  user_id bigint not null references users,
  enabled boolean not null default true,
  name text not null,
  sort int not null default 0,
  required boolean not null default true,
  multiple boolean not null default false,

  unique (trackable_category_attribute_id, user_id),
  foreign key (trackable_id, user_id) references trackables (trackable_id, user_id)
);

create index on trackable_category_attributes(user_id);
create index on trackable_category_attributes(trackable_id);


create table trackable_category_attribute_categories (
  trackable_category_attribute_category_id bigint primary key generated always as identity,
  trackable_category_attribute_id bigint not null,
  user_id bigint not null references users,
  enabled boolean not null default true,
  name text not null,

  unique (trackable_category_attribute_category_id, user_id),
  foreign key (trackable_category_attribute_id, user_id) references trackable_category_attributes (trackable_category_attribute_id, user_id)
);

create index on trackable_category_attribute_categories(user_id);
create index on trackable_category_attribute_categories(trackable_category_attribute_id);

create table trackable_notes (
  trackable_note_id bigint primary key generated always as identity,
  trackable_id bigint not null references trackables,
  user_id bigint not null references users,
  note text,
  added timestamptz default now(),
  modified timestamptz default now(),

  unique (trackable_note_id, user_id),
  foreign key (trackable_id, user_id) references trackables (trackable_id, user_id)
);

create index on trackable_notes(user_id);
create index on trackable_notes(trackable_id);

create table items (
  item_id bigint primary key generated always as identity,
  trackable_id bigint not null references trackables,
  user_id bigint not null references users,
  date date not null,
  note text,
  added timestamptz default now(),
  modified timestamptz default now(),

  unique (item_id, user_id),
  foreign key (trackable_id, user_id) references trackables (trackable_id, user_id)
);

create index on items(user_id, date, trackable_id);

create table item_numeric_attributes (
  item_numeric_attribute_id bigint primary key generated always as identity,
  item_id bigint not null,
  trackable_numeric_attribute_id bigint not null references trackable_numeric_attributes,
  user_id bigint not null references users,
  value double precision,

  unique (item_numeric_attribute_id, user_id),
  foreign key (item_id, user_id) references items (item_id, user_id)
);

create index on item_numeric_attributes(user_id);
create index on item_numeric_attributes(item_id);
create index on item_numeric_attributes(trackable_numeric_attribute_id);

create table item_category_attributes (
  item_category_attribute_id bigint primary key generated always as identity,
  item_id bigint not null,
  trackable_category_attribute_id bigint not null references trackable_category_attributes,
  user_id bigint not null references users,
  trackable_category_attribute_category_id bigint not null references trackable_category_attribute_categories,

  unique (item_category_attribute_id, user_id),
  foreign key (item_id, user_id) references items (item_id, user_id),
  foreign key (trackable_category_attribute_id, user_id) references trackable_category_attributes (trackable_category_attribute_id, user_id)
);

create index on item_category_attributes(user_id);
create index on item_category_attributes(item_id);
create index on item_category_attributes(trackable_category_attribute_id);

create table item_notes (
  item_note_id bigint primary key generated always as identity,
  item_id bigint not null references items,
  trackable_note_id bigint references trackable_notes,
  user_id bigint not null references users,
  note text not null,

  unique (item_note_id, user_id),
  foreign key (item_id, user_id) references items (item_id, user_id),
  foreign key (trackable_note_id, user_id) references trackable_notes (trackable_note_id, user_id)
);

create index on item_notes(user_id);
create index on item_notes(item_id);
create index on item_notes(trackable_note_id);

commit;
