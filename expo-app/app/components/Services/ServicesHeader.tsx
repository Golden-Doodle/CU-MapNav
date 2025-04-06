import React from "react";
import GenericHeader from "../../components/Header/GenericHeader";

interface ServicesHeaderProps {
  testID: string;
}

const ServicesHeader: React.FC<ServicesHeaderProps> = ({ testID }) => {
  return (
    <GenericHeader
      testID={testID}
      title="Services"
      noticeText="Select a service to get started."
      noticeIcon="info-circle"
    />
  );
};

export default ServicesHeader;
