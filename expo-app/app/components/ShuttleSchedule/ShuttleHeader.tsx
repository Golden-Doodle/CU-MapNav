import React from "react";
import GenericHeader from "../Header/GenericHeader";

interface ShuttleHeaderProps {
  testID: string;
}

const ShuttleHeader: React.FC<ShuttleHeaderProps> = ({ testID }) => {
  return (
    <GenericHeader
      testID={testID}
      title="Shuttle Bus"
      noticeText="Schedule is subject to change."
      noticeIcon="exclamation-circle"
    />
  );
};

export default ShuttleHeader;