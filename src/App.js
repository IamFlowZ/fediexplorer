import { useEffect, useState } from 'react'
 
export default function Page(props) {
  const searchParams = new URLSearchParams(document.location.search)
  // const router = useRouter()
  // console.log(router.query);

  const [loading, setLoading] = useState(true);
  console.log(searchParams)

  const targetInstance = searchParams.get('instance') ? searchParams.get('instance') : 'mastodon.social';

  console.log(targetInstance)

  const [instanceData, setInstanceData] = useState({});
  const [instancePeerData, setInstancePeerData] = useState([]);
  const [instanceActivityData, setInstanceActivityData] = useState({});
  const [instanceRuleData, setInstanceRuleData] = useState({});
  const [instanceBlocksData, setInstanceBlocksData] = useState({});

  const [peerPage, setPeerPage] = useState(0);
  const [shownPeers, setShownPeers] = useState([]);

  useEffect(() => {
    fetch(`https://${targetInstance}/api/v2/instance`)
      .then((res) => res.json())
      .then((json) => setInstanceData(json))

    fetch(`https://${targetInstance}/api/v1/instance/peers`)
      .then((res) => res.json())
      .then((json) => setInstancePeerData(json))

    // setInstancePeerData(['hachyderm.io'])

    fetch(`https://${targetInstance}/api/v1/instance/activity`)
      .then((res) => res.json())
      .then((json) => setInstanceActivityData(json))

    fetch(`https://${targetInstance}/api/v1/instance/rules`)
      .then((res) => res.json())
      .then((json) => setInstanceRuleData(json))

    fetch(`https://${targetInstance}/api/v1/instance/domain_blocks`)
      .then(res => {
        if (res.status === 404) {
          console.log('no domain blocks')
          return []
        } else {
          return res.json()
        }
      })
      .then((json) => setInstanceBlocksData(json))

    setLoading(false);
  }, [targetInstance])

  useEffect(() => {
    if (!instanceData.thumbnail) {
      console.log('wtf', instanceData)
    } else {
      fetch(instanceData.thumbnail.url)
    }
    setShownPeers(instancePeerData.slice(peerPage, peerPage + 10));
  }, [instancePeerData, peerPage])

  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    )
  }

  return (
    <main>
      <h1>Instance</h1>
      <h2>{instanceData.title}</h2>
      {
        // feel like i shouldn't have to do this........
        instanceData.thumbnail && (
          <img
            src={instanceData.thumbnail.url}
            alt="Picture of the author"
            width={500}
            height={500}
          />
        )
      }
      <p>{instanceData.domain}</p>
      <p>{instanceData.description}</p>

      <h2>Peers</h2>
      <p>{instancePeerData.length}</p>
      {/* todo: disable next once on last page */}
      <p>Page: {(peerPage / 10) + 1} of {Math.ceil(instancePeerData.length / 10)}</p>
      <button onClick={() => setPeerPage(peerPage + 10)}>Next</button>
      <button onClick={() => setPeerPage(peerPage - 10)} disabled={!peerPage}>Previous</button>
      <ul>
        {shownPeers.map((peer, i) => 
            <li
              // onClick={() => router.push(`/book?instance=${peer}`)}
              key={i}>
              {peer}
            </li>
          )
        }
      </ul>
    </main>
  )
}