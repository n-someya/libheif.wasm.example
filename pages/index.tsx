import { ChangeEvent, useState } from "react";
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Script from "next/script";



const Home: NextPage = () => {
  const [selectedImage, setSelectedImage]  = useState<File |null>(null);
  const doConvert = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    console.log(event.target.files[0]);
    setSelectedImage(event.target.files[0]);
    const fr = new FileReader()
    fr.onload = async (e) => {
      if (!fr.result) return
      if (fr.result instanceof ArrayBuffer) {
        const libheif = await (window as any).createLibheif()
        console.log(libheif)
        const decoder = libheif.heif_context_alloc();
        if (!decoder) {
            console.log("Could not create HEIF context");
            return
        }
        var error = libheif.heif_context_read_from_memory(decoder, fr.result);
        if (error.code !== libheif.heif_error_code.heif_error_Ok) {
            debugger
            console.log("Could not parse HEIF file", error);
            return
        }

        var ids = libheif.heif_js_context_get_list_of_top_level_image_IDs(decoder);
        if (!ids || ids.code) {
            console.log("Error loading image ids", ids);
            return;
        }
        else if (!ids.length) {
            console.log("No images found");
            return ;
        }

        var result = [];
        for (var i = 0; i < ids.length; i++) {
            var handle = libheif.heif_js_context_get_image_handle(decoder, ids[i]);
            if (!handle || handle.code) {
                console.log("Could not get image data for id", ids[i], handle);
                continue;
            }

            result.push(handle);
        }
        console.log(result)
      }
  }
   fr.readAsArrayBuffer(event.target.files[0])
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="/libheif.js" strategy='beforeInteractive'/>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            Next.js!
          </a>
        </h1>
        <button className='btn btn-primary'>This is button</button>
        <input
          type="file"
          name="myImage"
          onChange={doConvert}
      />
      {selectedImage && (
        <div>
        <img alt="not fount" width={"250px"} src={URL.createObjectURL(selectedImage)} />
        <br />
        <button onClick={()=>setSelectedImage(null)}>Remove</button>
        </div>
      )}

        <p className="mt-3 text-2xl">
          Get started by editing{' '}
          <code className="rounded-md bg-gray-100 p-3 font-mono text-lg">
            pages/index.tsx
          </code>
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
          <a
            href="https://nextjs.org/docs"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Documentation &rarr;</h3>
            <p className="mt-4 text-xl">
              Find in-depth information about Next.js features and API.
            </p>
          </a>

          <a
            href="https://nextjs.org/learn"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Learn &rarr;</h3>
            <p className="mt-4 text-xl">
              Learn about Next.js in an interactive course with quizzes!
            </p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Examples &rarr;</h3>
            <p className="mt-4 text-xl">
              Discover and deploy boilerplate example Next.js projects.
            </p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className="mt-6 w-96 rounded-xl border p-6 text-left hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Deploy &rarr;</h3>
            <p className="mt-4 text-xl">
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </a>
      </footer>
    </div>
  )
}

export default Home
