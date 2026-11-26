-- Execute após as migrations com uma conexão PostgreSQL administrativa descartável.
begin;
insert into auth.users(id) values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
insert into public.profiles(id,username,given_name)
select id, 'teste_' || right(id::text, 1), 'Teste'
from auth.users where id::text like '00000000-0000-0000-0000-00000000000%';

insert into public.finance_groups(id,owner_id,name) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Família');
insert into public.finance_group_members(group_id,profile_id,role) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','viewer'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','contributor');
insert into public.expenses(owner_id,group_id,category_id,cents,occurred_on,origin) values
 ('00000000-0000-0000-0000-000000000001',null,'food',100,current_date,'manual'),
 ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','food',120,current_date,'shared');

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$
begin
 if (select count(*) from public.expenses) <> 1 then
  raise exception 'O viewer deve ler somente o gasto compartilhado';
 end if;
 begin
  insert into public.expenses(group_id,category_id,cents,occurred_on,origin)
  values ('10000000-0000-0000-0000-000000000001','food',200,current_date,'shared');
  raise exception 'O viewer conseguiu registrar um gasto';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into storage.objects(bucket_id,name) values ('receipts','00000000-0000-0000-0000-000000000001/nota.png');
  raise exception 'O viewer conseguiu ocupar o namespace de outro usuário';
 exception when insufficient_privilege then null;
 end;
end $$;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
insert into public.expenses(group_id,category_id,cents,occurred_on,origin)
values ('10000000-0000-0000-0000-000000000001','food',300,current_date,'shared');
insert into storage.objects(bucket_id,name) values ('receipts','00000000-0000-0000-0000-000000000003/nota.png');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',true);
do $$
begin
 if exists(select 1 from public.expenses) or exists(select 1 from storage.objects where bucket_id = 'receipts') then
  raise exception 'Usuário externo conseguiu ler dados privados';
 end if;
 begin
  insert into public.business_profiles(id,name,cnpj,verification)
  values ('00000000-0000-0000-0000-000000000004','Empresa','11222333000181','verified');
  raise exception 'A empresa conseguiu verificar a própria conta';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
