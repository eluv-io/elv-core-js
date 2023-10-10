import React, {useState} from "react";
import {observer} from "mobx-react";
import {Button} from "@mantine/core";
import TenantInviteModal from "./TenantInviteModal";

const TenantInvites = observer(() => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  return (
    <>
      { showInviteModal ? <TenantInviteModal Close={() => setShowInviteModal(false)} /> : null }
      <div className="page-content">
        <Button onClick={() => setShowInviteModal(true)}>Invite User</Button>
      </div>
    </>
  );
});

export default TenantInvites;
