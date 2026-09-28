# Docent- en studentenbeheer

TaalCozy gebruikt drie rollen:

- `STUDENT`: volgt lessen en oefent. Heeft geen toegang tot de lesbouwer of studentenbeheer.
- `TEACHER`: maakt lessen en beheert de eigen studenten.
- `ADMIN`: kan lessen beheren en ziet alle studenten in het studentenbeheer.

## Eerste docent instellen

Nieuwe openbare registraties worden bewust altijd als `STUDENT` aangemaakt. Promote daarna lokaal een bestaand account:

```bash
npm run users:promote -- docent@school.nl TEACHER
```

Voor een beheerder:

```bash
npm run users:promote -- beheerder@school.nl ADMIN
```

De gebruiker moet daarna opnieuw inloggen om de nieuwe rol in de sessie te krijgen.

## Dagelijks beheer

Een docent gebruikt in de app **Studenten** om accounts aan te maken. Nieuwe studenten krijgen automatisch die docent als begeleider en kunnen direct inloggen met hun tijdelijke wachtwoord.

## Prisma Studio

Prisma Studio blijft een ontwikkelaarstool voor het inspecteren van de MySQL-database:

```bash
npm run db:studio
```

Voor normaal docentbeheer is Prisma Studio niet nodig. Gebruik daarvoor de studentenpagina in TaalCozy.
