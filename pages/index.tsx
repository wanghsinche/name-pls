import type { NextPage } from 'next'
import Head from 'next/head'
import Cropper from 'react-easy-crop'
import React, { useState, useCallback, useMemo, useRef, createRef } from 'react'
import { Area } from 'react-easy-crop/types'
import { getOutput } from '@/utils/image'
import axios from 'axios';
import { QueryClient, QueryClientProvider, useMutation } from 'react-query'
import { IData } from './api/recog'
import { loginByGithub } from '@/services/submitface';
import { SubmitPage } from '@/components/submit'
import Image from 'next/image'
import { Footer } from '@/components/footer'
import { Nav } from '@/components/nav'
import { info } from '@/components/info'

const api = '/api/recog';


const Home: NextPage = () => {

  const mutation = useMutation<IData, unknown, Blob>(api, (file: Blob) => {
    const form = new FormData();
    form.append('file', file);
    return axios.post(api, form).then(res => res.data)
  })

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [blob, setBlob] = useState<Blob>()
  const [outputBlob, setOutputBlob] = useState<Blob>();
  const inputRef = createRef<HTMLInputElement>();
  const outputRef = useRef<Area>();

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    outputRef.current = croppedAreaPixels
  }, [])

  const blobURL = useMemo(() => blob && URL.createObjectURL(blob), [blob]);

  const onConfirm = useCallback(async () => {
    if (!blobURL || !outputRef.current) {
      return;
    }
    const b = await getOutput(blobURL, outputRef.current, [336, 336]);
    console.log(b, b && URL.createObjectURL(b));


    if (!b) {
      return
    }
    setOutputBlob(b);
    mutation.mutate(b);

  }, [blobURL]);

  const submitDom = useMemo(() => outputBlob && <SubmitPage img={outputBlob} />, [outputBlob])

  return (
    <div >
      <Head>
        <title>Name PLS</title>
        <meta name="description" content="Japanese Adult Video Star Face Recognition, Search Actress By Image, Powered By Deep Learning" />
        <meta name="keywords" content="Face Recognition, Search Star By Image, Deep Learning, AI, JAV"></meta>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://cdn.jsdelivr.net/npm/daisyui@1.22.2/dist/full.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com/3.0.11"></script>
      </Head>

      <Nav />
      
      <main >
        

        <div className="flex flex-col items-center w-full h-full pt-10 bg-base-200">

          <div className="app">
            <div style={{ position: 'relative', width: 336, height: 336, }} className="mask mask-squircle" >
              <Cropper
                image={blobURL}
                crop={crop}
                zoom={zoom}
                zoomSpeed={0.1}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropSize={{ width: 224, height: 224 }}
              />
              {!blobURL && <div className="absolute h-full w-full top-0 left-0 bg-base-300	 flex flex-col items-center justify-center" style={{ backgroundColor: '#ccc' }} onClick={()=>inputRef.current?.click()}>
                <Image height={80} width={80} src="/face-id-svgrepo-com.svg"/>
                <p className="my-4">please select an image</p>
              </div>}
            </div>
          </div>
          <div className="container mx-auto py-4 text-center	">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value))
              }}
              className="zoom-range max-w-lg	w-52 "
            />

          </div>

          <section >
            {
              mutation.data && <div className="mb-4 text-2xl font-bold text-pink-500	">
                {mutation.data.name} 
              </div>
            }
            {
              mutation.data && mutation.data.possible.length && <p className="text-sm">maybe {mutation.data.possible.join(' or ')}</p>
            }

            {
              mutation.isLoading &&<button className="text-sky-500 btn btn-sm btn-ghost loading">loading...</button>
            }
            {
              mutation.isError && <p className="text-rose-600	text-sm">{String(mutation.error)}</p>
            }
          </section>



          <div className=" container mx-auto flex justify-center">
            <input type="file" ref={inputRef} className="hidden" onChange={e => { console.log(e.target.value, e.target.files); setBlob(e.target.files ? e.target.files[0] : void 0); }} onClick={(e) => (e.target as any).value = ''} />

            <button onClick={() => inputRef.current?.click()} className="btn btn-outline w-36 mx-2 my-8 ">Select</button>


            <button onClick={onConfirm} className="btn btn-outline btn-primary w-36 mx-2 my-8 ">Confirm</button>


          </div>
          <div className="text-right  mx-1 mb-8">
            {submitDom}
          </div>


        </div>


      </main>

      <Footer />
    </div>
  )
}


export default function App({ }) {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient} >
      <Home />
    </QueryClientProvider>
  );
}

