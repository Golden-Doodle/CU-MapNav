import React from "react";
import GenericHeader from "../../components/Header/GenericHeader";

interface SettingsHeaderProps {
  testID: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ testID }) => {
  return (
    <GenericHeader
      testID={testID}
      title="Settings"
      noticeText="Configurations are Permanent."
      noticeIcon="exclamation-circle"
    />
  );
};

export default SettingsHeader;
