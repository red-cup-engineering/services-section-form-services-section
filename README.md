# @red-cup-engineering/services-section-form-services-section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

The services-section-form topic section: three operations over one shared
record type, ServicesSectionForm — folding a directory listing into that
form, founding a new services-section directory in that form, and checking
a ServicesSectionForm record for conformance against
`services-section-form.schema.json` (kept once, upstream, at
`561-group-services-section/data/records/schema/services-section-form.schema.json`).

## Operations

### foldDirectoryEntriesIntoServicesSectionForm

~~~js
export function foldDirectoryEntriesIntoServicesSectionForm(request, contentTaxonomy)
~~~

Folds a section's path, its already-listed relative entries, and its
already-parsed package.json into a ServicesSectionForm record — a pure
transformation over its request and the explicitly supplied `contentTaxonomy`.
It performs no filesystem reads. The Group retains custody of the law data.

- request (object): `path` (repo-relative section path, used only for name
  and custody derivation), `entries` (an array of relative file/directory
  paths under the section; directories carry a trailing "/"), optional
  `packageJson` (the already-parsed package.json object).
- contentTaxonomy (object): the Group's `services-section-form-content-taxonomy.json` datum.
- Returns (object): A ServicesSectionForm record: type, version, path, name,
  custody, readme, package, content, code, data, services, legacy, stray,
  laws.
- Throws `TypeError` when path is not a non-empty string, or entries is not
  an array of strings.

Command: `fold-directory-entries-into-services-section-form` reads one JSON
value per input line and writes one JSON value per output line.

### deriveServicesSectionPath and checkServicesSectionPlacement

~~~js
export function deriveServicesSectionPath({ name, sections })
export function checkServicesSectionPlacement({ sections })
~~~

Derives a services section's path from its name, never by an agent's choice
(rule `placement-is-derived-from-the-name-by-script`). The custody is read
from the name: internal `561-group-*`, external `public-*`, otherwise the
house its last word names (`engineering`, `science`, `operations`). The
section nests under the existing section whose name it specializes most
closely: the one whose words appear, in order, within its own words, in the
same custody, the custody's root section being the least specific. A name
that derives no custody (`NAME_DERIVES_NO_CUSTODY`), has no parent
(`NO_PARENT`), or that two sections specialize equally (`AMBIGUOUS_PARENT`)
is refused: a placement the script cannot derive is a defect of the name.

`checkServicesSectionPlacement` takes sections as `{name, path}` and returns
how many stand where their names place them, each misplaced section with its
derived path, and each refusal.

Command: `derive-services-section-path` reads one JSON value per input line
(`{name, sections}` to derive, `{sections: [{name, path}]}` to check) and
writes one JSON value per output line.

### foundServicesSection

~~~js
export async function foundServicesSection(request)
~~~

Founds one new services-section directory in ServicesSectionForm shape — a
README.md and package.json — skipping either that already exists rather
than overwriting it, optionally appending one sentence to the parent
section's README, then folds the resulting directory entries through
`foldDirectoryEntriesIntoServicesSectionForm` (a same-package call, no
longer a separate dependency).

- request (`{path, name, custody, packageName, packageDescription, brand?,
  keywords?, parentReadmeSentence?, readme?, root?}`): the new section's
  repo-relative path (must be beneath
  `lib/emsenn/services/561-group/services/`), its display name, custody
  (`"science"|"engineering"|"operations"|"561-group"|"public"`), its package
  name and description, an optional caller-authored W3C JSON-LD 1.1 schema.org Brand
  object (actual @id, @type, name and identifier, not a name string), written
  by the existing Coesite source owner as a brand-records/*.jsonld identity;
  it confers no legal, office, authorial or market authority, optional extra keywords, an optional sentence to
  append to the parent section's README, an optional full README text, and
  an optional root.
- Returns (`Promise<object>`): the folded ServicesSectionForm record plus
  `created` and `skipped` relative-path arrays, and `brand` when supplied;
  or a refusal datum: `{refused: "PATH_OUTSIDE_SERVICES_TREE"}`,
  `{refused: "NAME_NOT_CONFORMANT", obstructions}`,
  `{refused: "REPOSITORY_ROOT_NOT_FOUND", cwd}`, or
  `{refusal: "SECTION_CARRIES_NO_BRAND", sectionPath, custody}`.
- Naming law (`sectionNameObstructions(path, name)`), checked before anything
  is written: the directory is the name; it sits in its parent's `services/`;
  it is kebab-case ending in `-services-section` (a section) or `-service` (a
  leaf service); and a section anywhere under `engineering-services-section/`
  names its engineering — `computer-engineering-services-section`, never
  `computer-services-section`. A new area is founded through this verb, not
  with `mkdir`.
- Throws `TypeError` when path, name, custody, packageName, or
  packageDescription is missing or not a string.

Command: `found-services-section` reads one JSON value per input line and
writes one JSON value per output line.

### checkServicesSectionFormConformance

~~~js
export function checkServicesSectionFormConformance(form, schema)
~~~

Checks a ServicesSectionForm record for conformance against
`services-section-form.schema.json`, calling
`@red-cup-engineering/computer-data-type-engine`'s
`validateJsonSchema` for the whole judgment; performs no schema evaluation
of its own.

- form (object): A ServicesSectionForm record — the exact shape
  `foldDirectoryEntriesIntoServicesSectionForm` produces.
- schema (object): the applicable Group `services-section-form.schema.json` datum.
- Returns (object): `{conformant, obstructions}` — conformant is whether
  form validates against `services-section-form.schema.json`; obstructions
  is the validator's own issue list (`{kind, path, keyword, message}`),
  empty when conformant is true.
- Throws `TypeError` when form is not a non-null, non-array object.

Command: `check-services-section-form-conformance` reads one JSON value per
input line and writes one JSON value per output line.

### Qualified Brand source consumer

The section founder prequalifies an optional Brand through the original
`@coesite-operations/enterprise-branding-services-section` source validator
**before creating** a section's README or package.json. Source authors must
supply a full schema.org `Brand` resource, not an opaque `brand: "Name"`:

```json
{
  "@context": "https://schema.org",
  "@id": "https://561.group/#brand",
  "@type": "Brand",
  "name": "561 Group",
  "identifier": "561-group"
}
```

After section conformance, the original Coesite writer writes a
`data/records/brand-records/<identifier>.jsonld` typed identity within that
section's actual source custody, where its original reader can read it.
An existing legacy service record, competing Brand, forged legalName,
unqualified IRI or private ineligible section is refused, not promoted by
a fabricated registry or invented URL. For source-owned house repos the
corresponding scoped root path is `data/records/brand-records/<identifier>.jsonld`.

This source-bound writer is upstream of the Group's
[enterprise Brand migration #203](https://github.com/561-group/561-group-services-section/pull/203)
and the independent [Causeway Shop receiver #3](https://github.com/causeway-services/shop.561.group/pull/3).
Successful founding is not an installed Coesite release, authorized
seller, generated Shop catalog, public Worker deployment or buyer receipt.

## Law binding

`readServicesSectionLaw(repositoryRoot)` (export `./read-services-section-law`)
reads the schema and content taxonomy from the Group's records in exactly that
repository. Imports and operation catalog construction do not read law data.
There is no `INFO_REPOSITORY_ROOT` or `/home/emsenn/info` fallback.

The fold/check commands select the repository containing their working directory.
The tree reader selects the repository containing the requested tree root.
The founder reads law from its selected write root before creating any file;
its native operation requires the host's repository binding. Caller input cannot
supply that binding. Missing law fails the selected operation before writing.
The shared MetroPlat release check verifies the law data in the release itself.
