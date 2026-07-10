const repoName = "Cocina-Sin-Estres-mai";
const isGithubPages = process.env.GITHUB_ACTIONS === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : "",
  images: { unoptimized: true },
};

module.exports = nextConfig;
