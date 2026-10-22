import { resolve } from "node:path";
import { readFileText } from "@red-cup-engineering/computer-file-engineering-services-section/read-file";
import { findAncestorMarkerFile } from "@red-cup-engineering/computer-filepath-engineering-services-section/find-ancestor-marker-file";

const GROUP_SERVICES = "lib/emsenn/services/561-group/services";
const LAW_DIRECTORY = `${GROUP_SERVICES}/561-group-services-section/data/records/schema`;
// The rule that binds each custody to the organization owning its repositories and package scope.
const ONE_HOME_RULE = `${GROUP_SERVICES}/561-group-services-section/lib/agency/rules/every-repository-package-and-section-has-one-home.json`;

/** Resolve the repository containing a selected directory; never select a machine's home checkout. */
export async function findServicesSectionRepositoryRoot(start) {
  return (await findAncestorMarkerFile({ start, marker: GROUP_SERVICES })).path;
}

/** Read the Group's law from exactly the supplied repository, before any dependent write. */
export async function readServicesSectionLaw(repositoryRoot) {
  if (typeof repositoryRoot !== "string" || repositoryRoot.length === 0) throw new TypeError("services-section law requires a repository root");
  const [schema, contentTaxonomy] = await Promise.all([
    readFileText(resolve(repositoryRoot, LAW_DIRECTORY, "services-section-form.schema.json")).then(JSON.parse),
    readFileText(resolve(repositoryRoot, LAW_DIRECTORY, "services-section-form-content-taxonomy.json")).then(JSON.parse),
  ]);
  return { schema, contentTaxonomy };
}

/** Read the custody-to-organization binding from the Group's one-home rule in exactly the supplied repository. */
export async function readSourceOrganizations(repositoryRoot) {
  if (typeof repositoryRoot !== "string" || repositoryRoot.length === 0) throw new TypeError("source organizations require a repository root");
  const rule = JSON.parse(await readFileText(resolve(repositoryRoot, ONE_HOME_RULE)));
  if (rule?.sourceOrganizations === null || typeof rule?.sourceOrganizations !== "object") throw new TypeError(`${ONE_HOME_RULE} holds no sourceOrganizations`);
  return Object.freeze({ ...rule.sourceOrganizations });
}
