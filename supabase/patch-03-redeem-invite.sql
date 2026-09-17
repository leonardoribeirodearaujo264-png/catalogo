drop function if exists cs_redeem_invite(text);

create or replace function cs_redeem_invite(p_code text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  invite cs_store_invites%rowtype;
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Você precisa estar logado para usar um convite.';
  end if;

  select * into invite from cs_store_invites
   where code = upper(trim(p_code)) and used_by is null and expires_at > now();

  if not found then
    raise exception 'Convite inválido, já utilizado ou expirado.';
  end if;

  insert into cs_store_members (store_id, user_id, role, permissions, display_name)
  values (invite.store_id, auth.uid(), invite.role,
          case when invite.permissions = '{}'::jsonb
               then '{"vehicles_create":true,"vehicles_edit":true,"vehicles_publish":false,"leads":true,"reports":false,"finance":false}'::jsonb
               else invite.permissions end,
          invite.display_name)
  on conflict (store_id, user_id) do update
    set role = excluded.role, permissions = excluded.permissions, status = 'active';

  update cs_store_invites set used_by = auth.uid(), used_at = now() where id = invite.id;

  insert into cs_audit_logs (store_id, action, entity, entity_id)
  values (invite.store_id, 'member.join', 'store_member', auth.uid()::text);

  select jsonb_build_object('store_id', s.id, 'slug', s.slug, 'name', s.name)
    into result
    from cs_stores s
   where s.id = invite.store_id;

  return result;
end;
$$;
