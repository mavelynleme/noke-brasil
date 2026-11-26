
insert into public.expense_categories(id,name) values ('food','Alimentação'),('transport','Transporte'),('home','Casa'),('other','Outros') on conflict (id) do nothing;
insert into public.products(name,is_public) values ('Nescau 200g',true),('Óleo 1L',true),('Pão de forma',true),('Café 500g',true) on conflict (name) do nothing;
