import { OrganizationList } from "@clerk/nextjs";

import React from 'react'

function CreateOrganizationPage() {
  return (
    <div>
      <OrganizationList
        hidePersonal
        afterSelectOrganizationUrl="/organization/:id" 
        afterCreateOrganizationUrl="/organization/:id"/>
    </div>
  )
}

export default CreateOrganizationPage;

