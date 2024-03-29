import { ChangeEvent, useState, useEffect } from "react";
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Script from "next/script";
import { HEIFModule } from './wasm_heif'


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

        const heifModule = await (window as any).wasm_heif() as HEIFModule
        console.log("start wasm heif", heifModule)
        const alpha = false; // RGBA somehow not yet working ¯\_(ツ)_/¯
        console.log(fr.result.byteLength)
        const buffer = new Uint8Array(fr.result as ArrayBuffer)
        console.log(buffer.length)
        const result = heifModule.decode(buffer, buffer.length, alpha); // decode image data and return a new Uint8Array
        if ( !(result instanceof Uint8Array)) {
          console.log("ERR: ", result)
          return
        }

        debugger
        const dimensions = heifModule.dimensions()
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        canvas.width = dimensions.width
			  canvas.height = dimensions.height
        console.log("get dimensions", canvas.height, canvas.width)
			  const ctx = canvas.getContext("2d");
        const image_data = ctx!.createImageData(canvas.width, canvas.height);
        // Start with a white image.
        for (var i=0; i<canvas.width*canvas.height; i++) {
          image_data.data[i*4] = result[i*3]
          image_data.data[i*4+1] = result[i*3+1]
          image_data.data[i*4+2] = result[i*3+2]
          image_data.data[i*4+3] = 255
        }
        // imgArray.set(alphaArray, canvas.height*canvas.width*3)
        ctx!.putImageData(image_data, 0, 0);
        heifModule.free(); // clean up memory after encoding is done
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
      {/* <Script src="/libheif.js" strategy='beforeInteractive'/> */}
      <Script src="/wasm_heif.js" strategy='beforeInteractive'/>

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
      <div id="container" >
        <canvas id="canvas"></canvas>
      </div>
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
