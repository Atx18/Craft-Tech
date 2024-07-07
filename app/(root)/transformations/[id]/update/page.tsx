import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import React from 'react'
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.action";
import { transformationTypes } from "@/constants";
import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";

const UpdateTransformationPage = async ({ params: { id } }: SearchParamProps) => {
  const {userId}=auth();
  if(!userId) redirect("/sign-in");
  const user=await getUserById(userId);
  const image=await getImageById(id);
  
  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];
  return (
     <>
    <Header title={transformation.title} subtitle={transformation.subTitle} />


    <section className="mt-10">
      <TransformationForm
      action="Update"
      userId={user._id}
      type={image.transformationType as TransformationTypeKey}
      creditBalance={user.creditBalance}
      config={image.config}
      data={image}
      />
    </section>
     </>
  )
}

export default UpdateTransformationPage


//"./" homepage-recent edits
//"./tranformations/add" =action ==add on clicking generative fill,recolor ,remove etc on the sidebar
//'./tranformations/id/'=iamgeid(database id),clicking on any pictures on recent edits redirects here,have delete image options
//'./tranformation/id/update'=clicking on update button on './tranformations/id/' redirects to this page 
//userId === image.author.clerkId means whether u are author of the iamge