// server action to update,delete the image using cloudinary api
"use server"
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose"
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from 'cloudinary'

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


//more complicated
//let cloudinary instance to able to pull the image sform somewhere
export async function getAllImages({limit=9,page=1,searchQuery=''}:{
  limit?:number;
  page?:number;
  searchQuery?:string;
}) {
  try {
    await connectToDatabase();
    
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
     let expression='folder=craft-tech'
     if(searchQuery){
      expression += ` AND ${searchQuery}`
     }
    //apending the search query as it will only search for specified iamges
    //finally we get get the resources back as images by destructoring them
    //return all resources 
    const { resources } = await cloudinary.search
    .expression(expression)
    .execute();
    
    //get the resources id  to get the  public id so that we can extract them from the images
    const resourceIds = resources.map((resource: any) => resource.public_id);


    let query={};

    if(searchQuery) {
      query = {
        publicId: {
          $in: resourceIds
        }
      }
    }
   // only  including the id from the database which are included in resources.id(from cloudinary)
   const skipAmount=(Number(page)-1)*limit
   
   
   //updated-1:means the latest one ,limit:means the latest one 
   //finds the user and image  together  with the help of poppulateUser function form teh backend after skipping the skipped amount od classes form the database 
   const images=await populateUser(Image.find(query))
   .sort({upadtedAt:-1}).skip(skipAmount).limit(limit)
   //total no of query iamges meeting the condition
   const totalImages = await Image.find(query).countDocuments();
   const savedImages = await Image.find().countDocuments();
   //total no of  iamges total


   return {
    data: JSON.parse(JSON.stringify(images)),
    totalPage: Math.ceil(totalImages / limit),//how many pages [limit refers to no of pages in onr page]
    savedImages,
  }

  } catch (error) {
    handleError(error)
  }
    //When revalidatePath is called, it signals the application to fetch fresh data for the specified path. This process can involve calling APIs, querying databases, or performing any necessary operations to ensure that the latest data is fetched.
    //Update Content: Once the new data is fetched, the content of the page or component associated with the path is updated to reflect the latest information. This can involve re-rendering components, updating state, or performing other actions to ensure the UI is in sync with the latest data.
    //The path parameter specifies the route or URL that you want to revalidate. This could be a specific page or a set of pages that rely on certain data.
}




