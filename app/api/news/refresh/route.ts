import {refreshNews} from '@/lib/news';
import {fail,requireTeacher} from '@/lib/server';
export async function POST(r:Request){const auth=await requireTeacher(r);if(auth.error)return auth.error;try{return Response.json(await refreshNews())}catch{return fail('Nieuws bijwerken is tijdelijk niet gelukt.',503)}}
