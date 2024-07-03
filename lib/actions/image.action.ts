// server action to update,delete the image using cloudinary api
"use server"
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";


const populateUser = (query: any) => query.populate({
  path: 'author',
  model: User,
  select: '_id firstName lastName clerkId'
})
  

// Path: The path option specifies which field to populate. In this case, it is author.
// Model: The model option specifies which model to use for population. Here, it is the User model.
// Select: The select option specifies which fields to include in the populated documents. In this case, only _id, firstName, and lastName fields from the User documents will be included.


//ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
      await connectToDatabase();
     //userid:clerkid
      const author = await User.findById(userId);
  
      if (!author) {
        throw new Error("User not found");
      }
      // ...image means expanding or stretching all iamge properties
      const newImage = await Image.create({
        ...image,
        author: author._id,
      })
  
      revalidatePath(path);
  
      return JSON.parse(JSON.stringify(newImage));
    } catch (error) {
      handleError(error)
    }
    //When revalidatePath is called, it signals the application to fetch fresh data for the specified path. This process can involve calling APIs, querying databases, or performing any necessary operations to ensure that the latest data is fetched.
    //Update Content: Once the new data is fetched, the content of the page or component associated with the path is updated to reflect the latest information. This can involve re-rendering components, updating state, or performing other actions to ensure the UI is in sync with the latest data.
    //The path parameter specifies the route or URL that you want to revalidate. This could be a specific page or a set of pages that rely on certain data.
}






//UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
      await connectToDatabase();
  
      const imageToUpdate = await Image.findById(image._id);
  
      if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
        throw new Error("Unauthorized or image not found");
      }
  
      const updatedImage = await Image.findByIdAndUpdate(
        imageToUpdate._id,
        image,
        { new: true }
      )
  
      revalidatePath(path);
  
      return JSON.parse(JSON.stringify(updatedImage));
    } catch (error) {
      handleError(error)
    }
    //When revalidatePath is called, it signals the application to fetch fresh data for the specified path. This process can involve calling APIs, querying databases, or performing any necessary operations to ensure that the latest data is fetched.
    //Update Content: Once the new data is fetched, the content of the page or component associated with the path is updated to reflect the latest information. This can involve re-rendering components, updating state, or performing other actions to ensure the UI is in sync with the latest data.
    //The path parameter specifies the route or URL that you want to revalidate. This could be a specific page or a set of pages that rely on certain data.
}







//delete image
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error)
  } finally{
    redirect('/')
  }
    //When revalidatePath is called, it signals the application to fetch fresh data for the specified path. This process can involve calling APIs, querying databases, or performing any necessary operations to ensure that the latest data is fetched.
    //Update Content: Once the new data is fetched, the content of the page or component associated with the path is updated to reflect the latest information. This can involve re-rendering components, updating state, or performing other actions to ensure the UI is in sync with the latest data.
    //The path parameter specifies the route or URL that you want to revalidate. This could be a specific page or a set of pages that rely on certain data.
}





//get it by id
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if(!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error)
  }
    //When revalidatePath is called, it signals the application to fetch fresh data for the specified path. This process can involve calling APIs, querying databases, or performing any necessary operations to ensure that the latest data is fetched.
    //Update Content: Once the new data is fetched, the content of the page or component associated with the path is updated to reflect the latest information. This can involve re-rendering components, updating state, or performing other actions to ensure the UI is in sync with the latest data.
    //The path parameter specifies the route or URL that you want to revalidate. This could be a specific page or a set of pages that rely on certain data.
}



