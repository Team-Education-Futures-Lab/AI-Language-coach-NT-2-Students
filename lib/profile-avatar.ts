export const avatarChoices=['🌿','🌻','🌊','🦉','🦊','🐱','🐼','⭐'];
export function validAvatar(value:unknown):value is string{return typeof value==='string'&&(value===''||avatarChoices.includes(value)||(value.length<=40000&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/.test(value)))}
