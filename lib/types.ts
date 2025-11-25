import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/routers/_app';

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type TabWithRelations = RouterOutputs['tabs']['getById'];
export type TabListItem = RouterOutputs['search']['search']['tabs'][number];
export type AdminTabListItem = RouterOutputs['admin']['listTabs']['tabs'][number];
export type AdminUploadListItem = RouterOutputs['admin']['listUploads']['uploads'][number];
export type AdListItem = RouterOutputs['ads']['list']['ads'][number];
