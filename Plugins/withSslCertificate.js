const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");

const fs = require("fs");
const path = require("path");

function withSslCertificate(config) {
  // Add networkSecurityConfig to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (!mainApplication) {
      throw new Error("Android application tag not found.");
    }

    mainApplication.$ = mainApplication.$ || {};

    mainApplication.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";

    return config;
  });

  // Copy certificate and create network_security_config.xml
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidProjectRoot = config.modRequest.platformProjectRoot;

      const certificateSource = path.join(
        projectRoot,
        "credentials",
        "ssl",
        "my_cert.crt"
      );

      const rawDirectory = path.join(
        androidProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "raw"
      );

      const xmlDirectory = path.join(
        androidProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml"
      );

      if (!fs.existsSync(certificateSource)) {
        throw new Error(
          `SSL certificate not found: ${certificateSource}`
        );
      }

      fs.mkdirSync(rawDirectory, { recursive: true });
      fs.mkdirSync(xmlDirectory, { recursive: true });

      // Copy certificate
      fs.copyFileSync(
        certificateSource,
        path.join(rawDirectory, "my_cert.crt")
      );

      // Create Android network security configuration
      const networkSecurityConfig = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">pmkapi.guvnl.com</domain>

        <trust-anchors>
            <certificates src="@raw/my_cert" />
            <certificates src="system" />
        </trust-anchors>
    </domain-config>
</network-security-config>
`;

      fs.writeFileSync(
        path.join(xmlDirectory, "network_security_config.xml"),
        networkSecurityConfig
      );

      return config;
    },
  ]);

  return config;
}

module.exports = withSslCertificate;