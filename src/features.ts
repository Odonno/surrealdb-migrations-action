import semver from "semver";

type FeatureNames = "apply --dry-run" | "apply --validate-version-order";

type Version = `${number}.${number}.${number}`;

type Features = {
  [name in FeatureNames]: {
    since: Version;
  };
};

const features: Features = {
  "apply --dry-run": {
    since: "0.9.6",
  },
  "apply --validate-version-order": {
    since: "0.9.6",
  },
};

export const isFeatureAvailable = (
  name: FeatureNames,
  version: string
): boolean => {
  const feature = features[name];

  return semver.gte(version, feature.since);
};
