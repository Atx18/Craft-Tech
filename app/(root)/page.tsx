import { Collection } from "@/components/shared/Collection"
import { navLinks } from "@/constants"
import { getAllImages } from "@/lib/actions/image.action" 
import Image from "next/image"
import Link from "next/link"

const Home = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';

  const images = await getAllImages({ page, searchQuery})
 //getting the userid form clerk(clerk id)
 //imageid is the database image._id which we are appending to the url
 //user._id is the database userID
  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Craft-tech
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection 
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPage}
          page={page}
        />
      </section>
    </>
  )
}
//"./" homepage-recent edits
//"./tranformations/add" =action ==add on clicking generative fill,recolor ,remove etc on the sidebar
//'./tranformations/id/'=iamgeid(database id),clicking on any pictures on recent edits redirects here,have delete image options
//'./tranformation/id/update'=clicking on update button on './tranformations/id/' redirects to this page 
//userId === image.author.clerkId means whether u are author of the iamge

export default Home