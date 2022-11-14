import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import path from "path";
import semver, { SemVer } from "semver";

dotenv.config({ path: path.resolve(__dirname + "../../../.env") });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const semVerExplainPrompt = `Semantic Versioning Specification (SemVer)
---
1. A normal version number MUST take the form X.Y.Z where X, Y, and Z are
non-negative integers, and MUST NOT contain leading zeroes. X is the
major version, Y is the minor version, and Z is the patch version.
Each element MUST increase numerically. For instance: 1.9.0 -> 1.10.0 -> 1.11.0.
1. Once a versioned package has been released, the contents of that version
MUST NOT be modified. Any modifications MUST be released as a new version.
1. Major version zero (0.y.z) is for initial development. Anything MAY change
at any time. The public API SHOULD NOT be considered stable.
1. Version 1.0.0 defines the public API. The way in which the version number
is incremented after this release is dependent on this public API and how it
changes.
1. Patch version Z (x.y.Z | x > 0) MUST be incremented if only backwards
compatible bug fixes are introduced. A bug fix is defined as an internal
change that fixes incorrect behavior.
1. Minor version Y (x.Y.z | x > 0) MUST be incremented if new, backwards
compatible functionality is introduced to the public API. It MUST be
incremented if any public API functionality is marked as deprecated. It MAY be
incremented if substantial new functionality or improvements are introduced
within the private code. It MAY include patch level changes. Patch version
MUST be reset to 0 when minor version is incremented.
1. Major version X (X.y.z | X > 0) MUST be incremented if any backwards
incompatible changes are introduced to the public API. It MAY also include minor
and patch level changes. Patch and minor versions MUST be reset to 0 when major
version is incremented.
1. A pre-release version MAY be denoted by appending a hyphen and a
series of dot separated identifiers immediately following the patch
version. Identifiers MUST comprise only ASCII alphanumerics and hyphens
[0-9A-Za-z-]. Identifiers MUST NOT be empty. Numeric identifiers MUST
NOT include leading zeroes. Pre-release versions have a lower
precedence than the associated normal version. A pre-release version
indicates that the version is unstable and might not satisfy the
intended compatibility requirements as denoted by its associated
normal version. Examples: 1.0.0-alpha, 1.0.0-alpha.1, 1.0.0-0.3.7,
1.0.0-x.7.z.92, 1.0.0-x-y-z.--.
1. Build metadata MAY be denoted by appending a plus sign and a series of dot
separated identifiers immediately following the patch or pre-release version.
Identifiers MUST comprise only ASCII alphanumerics and hyphens [0-9A-Za-z-].
Identifiers MUST NOT be empty. Build metadata MUST be ignored when determining
version precedence. Thus two versions that differ only in the build metadata,
have the same precedence. Examples: 1.0.0-alpha+001, 1.0.0+20130313144700,
1.0.0-beta+exp.sha.5114f85, 1.0.0+21AF26D3----117B344092BD.
1. Precedence refers to how versions are compared to each other when ordered.
   1. Precedence MUST be calculated by separating the version into major,
      minor, patch and pre-release identifiers in that order (Build metadata
      does not figure into precedence).
   1. Precedence is determined by the first difference when comparing each of
      these identifiers from left to right as follows: Major, minor, and patch
      versions are always compared numerically.
      Example: 1.0.0 < 2.0.0 < 2.1.0 < 2.1.1.
   1. When major, minor, and patch are equal, a pre-release version has lower
      precedence than a normal version:
      Example: 1.0.0-alpha < 1.0.0.
   1. Precedence for two pre-release versions with the same major, minor, and
      patch version MUST be determined by comparing each dot separated identifier
      from left to right until a difference is found as follows:
      1. Identifiers consisting of only digits are compared numerically.
      1. Identifiers with letters or hyphens are compared lexically in ASCII
         sort order.
      1. Numeric identifiers always have lower precedence than non-numeric
         identifiers.
      1. A larger set of pre-release fields has a higher precedence than a
         smaller set, if all of the preceding identifiers are equal.
      Example: 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta < 1.0.0-beta < 
      1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0.

FAQ
---
### Does SemVer have a size limit on the version string?
No, but use good judgment. A 255 character version string is probably overkill,
for example. Also, specific systems may impose their own limits on the size of
the string.
### Is "v1.2.3" a semantic version?
No, "v1.2.3" is not a semantic version. However, prefixing a semantic version
with a "v" is a common way (in English) to indicate it is a version number.
Abbreviating "version" as "v" is often seen with version control.
### Is there a suggested regular expression (RegEx) to check a SemVer string?
One with numbered capture groups instead (so cg1 = major, cg2 = minor,
cg3 = patch, cg4 = prerelease and cg5 = buildmetadata).
### Is there a suggested regular expression (RegEx) to check a SemVer string?
Yes, here is one with numbered capture groups instead (so cg1 = major, cg2 =
minor, cg3 = patch, cg4 = prerelease and cg5 = buildmetadata).
\`\`\`
^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$
\`\`\`
===
`;

const semVerExamplesPrompt = `Examples:
===
I have the following version(s):
Beta v0.0.3
Beta v0.0.3
Beta v0.0.1
All of these version(s) converted to meet the Semantic Versioning standard:
0.0.3
0.0.3-pre.1
0.0.1
===
I have the following version(s):
0.96.2.0
0.96.2.0 for 1.13.2
0.96.2.0 for 1.12.2
0.96.1.0
0.96.1.0 for MC 1.13.2
0.96.0.0
0.96.0.0 for MC 1.13.2
0.95.2.0
0.95.1.0 for 1.13.2
0.95.1.0
All of these version(s) converted to meet the Semantic Versioning standard:
0.96.2
0.96.2-mc.1.13.2
0.96.2-mc.1.12.2
0.96.1
0.96.1-mc.1.13.2
0.96.0
0.96.0-mc.1.13.2
0.95.2
0.95.1-mc.1.13.2
0.95.1
===
I have the following version(s):
0.5.0.0
0.4.1.7
0.3.1.4
0.3.1.1
0.3.0.8
0.3.0.7
0.2.1.0
All of these version(s) converted to meet the Semantic Versioning standard:
0.5.0
0.4.1-7
0.3.1-4
0.3.1-1
0.3.0-8
0.3.0-7
0.2.1
===
I have the following version(s):
1.9.3.0
1.9.2.9
1.9.2.8
1.9.2.7
1.9.2.7
1.9.2.6
1.9.2.5
1.9.2.4
1.9.2.3
1.9.2.2
1.9.2.1
1.9.2.0
1.9.1.9
All of these version(s) converted to meet the Semantic Versioning standard:
1.9.3
1.9.2-9
1.9.2-8
1.9.2-7
1.9.2-7-pre.1
1.9.2-6
1.9.2-5
1.9.2-4
1.9.2-3
1.9.2-2
1.9.2-1
1.9.2
1.9.1-9
===
`;

export default async function main(versions: string[]): Promise<string[]> {
  const prompt =
    semVerExplainPrompt +
    semVerExamplesPrompt +
    "I have the following version(s):\n" +
    versions.join("\n") +
    "\nAll of these version(s) converted to meet the Semantic Versioning standard:\n";
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt,
    temperature: 0,
    max_tokens: 1000,
    stop: ["==="],
  });
  const responseText: string = response.data.choices[0].text || "";
  const results: string[] = responseText.split("\n").map((v) => v.trim());
  return results.map((result) => {
    const parsedSemVer = semver.parse(result);
    if (parsedSemVer) {
      if (parsedSemVer.build.length > 0) {
        return parsedSemVer.format() + "+" + parsedSemVer.build.join(".");
      } else {
        return parsedSemVer.format();
      }
    } else {
      const cleanedSemVer = semver.clean(result);
      if (cleanedSemVer) {
        return cleanedSemVer;
      } else {
        const coercedSemVer = semver.coerce(result);
        if (coercedSemVer) {
          return coercedSemVer.format();
        } else {
          return "0.0.0";
        }
      }
    }
  });
}

if (require.main === module) {
  main([
    "2.19.7",
    "2.19.6",
    "2.19.4",
    "2.19.3",
    "2.19.2",
    "2.19.0",
    "2.18.2",
    "2.18.1",
    "2.18.0",
    "2.17.2",
    "2.17.1",
    "2.17.0",
    "2.16.1",
    "2.16.0.3",
    "2.16.0.1",
    "2.15.0.1",
    "2.15.0.1",
    "2.0.1-b488",
    "2.0.1-b370",
    "201-b354",
    "2.0.1-b330",
    "2.0.1-b276",
    "2.0.1-b267",
    "2.0.1-b245",
    "2.0.1-b237",
    "2.0.1-b192",
    "2.0.1-b177",
    "2.0.1",
  ]).then((results) => {
    console.log(results);
  });
}
