import { useEffect, useState } from "react";

export default function Page(props) {
  const searchParams = new URLSearchParams(document.location.search);

  const [loading, setLoading] = useState(true);
  console.log(searchParams);

  const targetInstance = searchParams.get("instance")
    ? searchParams.get("instance")
    : "mastodon.social";

  console.log(targetInstance);

  const [instanceData, setInstanceData] = useState({});
  const [instancePeerData, setInstancePeerData] = useState([]);
  const [instanceActivityData, setInstanceActivityData] = useState({});
  const [instanceRuleData, setInstanceRuleData] = useState([]);
  const [instanceBlocksData, setInstanceBlocksData] = useState([]);

  const [peerPage, setPeerPage] = useState(0);
  const [shownPeers, setShownPeers] = useState([]);

  const [blockPage, setBlockPage] = useState(0);
  const [shownBlocks, setShownBlocks] = useState([]);

  useEffect(() => {
    fetch(`https://${targetInstance}/api/v2/instance`)
      .then((res) => res.json())
      .then((json) => setInstanceData(json));

    fetch(`https://${targetInstance}/api/v1/instance/peers`)
      .then((res) => res.json())
      .then((json) => setInstancePeerData(json));

    // setInstancePeerData(['hachyderm.io'])

    fetch(`https://${targetInstance}/api/v1/instance/activity`)
      .then((res) => res.json())
      .then((json) => setInstanceActivityData(json));

    fetch(`https://${targetInstance}/api/v1/instance/rules`)
      .then((res) => res.json())
      .then((json) => setInstanceRuleData(json));

    fetch(`https://${targetInstance}/api/v1/instance/domain_blocks`)
      .then((res) => {
        if (res.status === 404) {
          console.log("no domain blocks");
          return [];
        } else {
          return res.json();
        }
      })
      .then((json) => setInstanceBlocksData(json));

    setLoading(false);
  }, [targetInstance]);

  useEffect(() => {
    if (!instanceData.thumbnail) {
      console.log("wtf", instanceData);
    } else {
      fetch(instanceData.thumbnail.url);
    }
    setShownPeers(instancePeerData.slice(peerPage, peerPage + 10));
    setShownBlocks(instanceBlocksData.slice(blockPage, blockPage + 10));
  }, [instanceData, instancePeerData, peerPage, instanceBlocksData, blockPage]);

  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        backgroundColor: "var(--foreground)",
        padding: "1rem",
        borderRadius: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div>
          {
            // feel like i shouldn't have to do this........
            instanceData.thumbnail && (
              <img
                src={instanceData.thumbnail.url}
                alt="Instance header"
                max-width="100%"
                height="auto"
              />
            )
          }
          <h2>{instanceData.title}</h2>
          <p>{instanceData.description}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2>Rules</h2>
              <ul>
                {instanceRuleData &&
                  instanceRuleData.map((rule) => (
                    <li key={rule.id}>{rule.text}</li>
                  ))}
              </ul>
            </div>

            <div>
              <h2>Peers ✅</h2>
              {/* <p>{instancePeerData.length}</p> */}
              {/* todo: disable next once on last page */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "end",
                }}
              >
                <p>
                  Page: {peerPage / 10 + 1} of{" "}
                  {Math.ceil(instancePeerData.length / 10)}
                </p>
                <div>
                  <input type="text" placeholder="search" onChange={(event) => {
                    const newPeers = instancePeerData.filter((peer) => {
                      return peer.includes(event.target.value)
                    })
                    setShownPeers(newPeers.slice(peerPage, peerPage + 10))
                  }}/>
                  <button onClick={() => setPeerPage(peerPage + 10)}>
                    Next
                  </button>
                  <button
                    onClick={() => setPeerPage(peerPage - 10)}
                    disabled={!peerPage}
                  >
                    Previous
                  </button>
                </div>
              </div>
              <ul>
                {shownPeers.map((peer, i) => (
                  <li
                    onClick={() => {
                      const newParams = new URLSearchParams();
                      newParams.set("instance", peer);
                      window.location.search = newParams.toString();
                    }}
                    key={i}
                  >
                    {peer}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2>Blocked instances ❌</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "end",
                }}
              >
                {/* <p>{instanceBlocksData.length}</p> */}
                {/* todo: disable next once on last page */}
                <p>
                  Page: {blockPage / 10 + 1} of{" "}
                  {Math.ceil(instanceBlocksData.length / 10)}
                </p>
                <div>
                  <input type="text" placeholder="search" onChange={(event) => {
                    const newBlocks = instanceBlocksData.filter((block) => {
                      return block.domain.includes(event.target.value)
                    })
                    setShownBlocks(newBlocks.slice(blockPage, blockPage + 10))
                  }}/>
                  <button onClick={() => setBlockPage(peerPage + 10)}>
                    Next
                  </button>
                  <button
                    onClick={() => setBlockPage(peerPage - 10)}
                    disabled={!blockPage}
                  >
                    Previous
                  </button>
                </div>
              </div>
              <ul>
                {shownBlocks.map((block, i) => (
                  <li
                    onClick={() => {
                      const newParams = new URLSearchParams();
                      newParams.set("instance", block.domain);
                      window.location.search = newParams.toString();
                    }}
                    key={i}
                  >
                    {block.domain}: {block.severity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </main>
  );
}
