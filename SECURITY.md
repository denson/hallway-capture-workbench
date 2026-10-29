# Security and public sharing

## Credentials

No GitHub token or OpenAI API key is needed to run the example locally. Authenticate publishing tools through their normal sign-in or credential-helper flow. Never paste a credential into an issue or a public discussion.

If a key is exposed, revoke it with its provider and rotate affected integrations. Deleting the text or making a repository private does not invalidate the key.

## Reference files and saved layouts

`references/`, `private/`, `.env*`, local hosting configuration and generated output are ignored. `.gitignore` does not untrack a file that was already committed. Everything in `public/` can be served to visitors.

Layout JSON can reveal room arrangements and furniture placement. Treat it according to the sensitivity of the design. Browser storage belongs to an origin and device; shared computers are not private storage.

## Checks before publishing

Review staged files and run `npm run check:public`. The check reports filenames and categories, never the matched secret value. It looks for common token formats, private-key markers, personal paths, email addresses and deployment identities. It can miss secrets and can flag harmless text.

Use GitHub secret scanning and push protection where available, and review dependency advisories. Run `npm audit` after dependency changes. Never use `npm audit fix --force` without reviewing compatibility and running validation.

The initial public template is prepared from a clean source copy without the originating project's Git history or personal reference images. Keep subsequent commits equally careful.

## Report a vulnerability

Do not open a public issue containing an exploit secret, private image or credential. Use the repository's private vulnerability reporting feature if enabled. Otherwise contact the maintainer through an appropriate private channel before disclosing sensitive details.

## Runtime scope

This is an example 3D editor, not a multi-user storage service. There is no server-side image ingestion or account database in the default application. Treat imported files as untrusted and keep validation in place. Never add client-side secrets when extending it with AI or cloud services.
