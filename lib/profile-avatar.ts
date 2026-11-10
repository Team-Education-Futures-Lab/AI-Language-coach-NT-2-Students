export const avatarChoices=Array.from({length:12},(_,i)=>'portrait-'+String(i+1).padStart(2,'0'));
const legacy=['🌿','🌻','🌊','🦉','🦊','🐱','🐼','⭐'];
export function avatarSource(value:string){if(value.startsWith('data:image/jpeg;'))return value;const id=avatarChoices.includes(value)?value:legacy.includes(value)?avatarChoices[legacy.indexOf(value)]:null;return id?'/avatars/'+id+'.svg':''}
export function validAvatar(value:unknown):value is string{return typeof value==='string'&&(value===''||avatarChoices.includes(value)||legacy.includes(value)||(value.length<=40000&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/.test(value)))}
