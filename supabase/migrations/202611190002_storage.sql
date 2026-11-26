
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
 ('avatars','avatars',false,8388608,array['image/jpeg','image/png','image/webp']),
 ('receipts','receipts',false,8388608,array['image/jpeg','image/png','image/webp']),
 ('offer-images','offer-images',false,8388608,array['image/jpeg','image/png','image/webp']);

create policy own_noke_images on storage.objects for all to authenticated
using (
 bucket_id in ('avatars','receipts','offer-images')
 and (storage.foldername(name))[1] = (select auth.uid())::text
 and (bucket_id <> 'offer-images' or exists(select 1 from public.business_profiles where id = (select auth.uid())))
)
with check (
 bucket_id in ('avatars','receipts','offer-images')
 and (storage.foldername(name))[1] = (select auth.uid())::text
 and (bucket_id <> 'offer-images' or exists(select 1 from public.business_profiles where id = (select auth.uid())))
);
