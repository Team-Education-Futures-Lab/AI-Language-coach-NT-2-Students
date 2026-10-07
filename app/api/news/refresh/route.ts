import {refreshNews} from '@/lib/news';
import {fail} from '@/lib/server';
// Shared feed maintenance. The owner-private Sites access boundary authenticates
// unattended callers with its service token; no individual profile is accessed.
export async function POST(){try{return Response.json(await refreshNews())}catch{return fail('Nieuws bijwerken is tijdelijk niet gelukt.',503)}}
