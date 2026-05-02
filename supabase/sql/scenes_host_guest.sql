-- 标记「局长」设备 id，用于前端识别我发起的局（与 app 中 host_guest_id / adaptScene.hostGuestId 一致）
alter table public.scenes
  add column if not exists host_guest_id text;

comment on column public.scenes.host_guest_id is '创建该局时的客户端 guest_id，与 localStorage 中设备 id 一致';
