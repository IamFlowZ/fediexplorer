import { useEffect, useState } from "react";

export default function Page(props) {
  const searchParams = new URLSearchParams(document.location.search);

  const [loading, setLoading] = useState(true);
  console.log(searchParams);

  const targetInstance = searchParams.get("instance")
    ? searchParams.get("instance")
    : "mastodon.social";

  console.log(targetInstance);

  const [tempInstance, setTempInstance] = useState("");

  const [instanceData, setInstanceData] = useState({});
  const [instanceDataCallSuccess, setInstanceDataCallSuccess] = useState(false);

  const [instancePeerData, setInstancePeerData] = useState([]);
  const [instancePeerDataCallSuccess, setInstancePeerDataCallSuccess] =
    useState(false);

  const [instanceActivityData, setInstanceActivityData] = useState({});
  const [instanceActivityDataCallSuccess, setInstanceActivityDataCallSuccess] =
    useState(false);

  const [instanceRuleData, setInstanceRuleData] = useState([]);
  const [instanceRuleDataCallSuccess, setInstanceRuleDataCallSuccess] =
    useState(false);

  const [instanceBlocksData, setInstanceBlocksData] = useState([]);
  const [instanceBlocksDataCallSuccess, setInstanceBlocksDataCallSuccess] =
    useState(false);

  const [peerPage, setPeerPage] = useState(0);
  const [shownPeers, setShownPeers] = useState([]);

  const [blockPage, setBlockPage] = useState(0);
  const [shownBlocks, setShownBlocks] = useState([]);

  useEffect(() => {
    fetch(`https://${targetInstance}/api/v2/instance`)
      .then((res) => res.json())
      .then((json) => {
        setInstanceData(json);
        setInstanceDataCallSuccess(true);
      })
      .catch((err) => {
        console.error("failed instance call", err);
      });

    fetch(`https://${targetInstance}/api/v1/instance/peers`)
      .then((res) => res.json())
      .then((json) => {
        setInstancePeerData(json);
        setInstancePeerDataCallSuccess(true);
      })
      .catch((err) => {
        console.error("failed peers call", err);
      });

    fetch(`https://${targetInstance}/api/v1/instance/activity`)
      .then((res) => res.json())
      .then((json) => {
        setInstanceActivityData(json);
        setInstanceActivityDataCallSuccess(true);
      })
      .catch((err) => {
        console.error("failed activity call", err);
      });

    fetch(`https://${targetInstance}/api/v1/instance/rules`)
      .then((res) => res.json())
      .then((json) => {
        setInstanceRuleData(json);
        setInstanceRuleDataCallSuccess(true);
      })
      .catch((err) => {
        console.error("failed rules call", err);
      });

    fetch(`https://${targetInstance}/api/v1/instance/domain_blocks`)
      .then((res) => {
        if (res.status === 404) {
          console.log("no domain blocks");
          return [];
        } else if (res.status !== 200) {
          throw new Error("failed domain blocks call");
        }
        return res.json();
      })
      .then((json) => {
        setInstanceBlocksData(json);
        setInstanceBlocksDataCallSuccess(true);
      });

    if (
      instanceDataCallSuccess &&
      instancePeerDataCallSuccess &&
      instanceActivityDataCallSuccess &&
      instanceRuleDataCallSuccess &&
      instanceBlocksDataCallSuccess
    ) {
      setLoading(false);
    }
  }, [
    instanceActivityDataCallSuccess,
    instanceBlocksDataCallSuccess,
    instanceDataCallSuccess,
    instancePeerDataCallSuccess,
    instanceRuleDataCallSuccess,
    targetInstance,
  ]);

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
    <>
      <nav
        style={{
          display: "flex",
          backgroundColor: "var(--foreground)",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
        }}
      >
        <i>fediexplorer</i>
      </nav>
      <main
        style={{
          backgroundColor: "var(--background)",
          padding: "1rem",
          margin: "2rem",
          borderRadius: "1rem",
          maxWidth: "100vw",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "1300px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Find your instance..."
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  const instance = event.target.value;
                  if (instance.includes(".")) {
                    console.log("here");
                    const newParams = new URLSearchParams();
                    newParams.set("instance", instance);
                    window.location.search = newParams.toString();
                  }
                }}
                onChange={(event) => {
                  const instance = event.target.value;
                  if (instance.includes(".")) {
                    setTempInstance(instance);
                  }
                }}
              />
              <button
                onClick={() => {
                  const instance = tempInstance;
                  if (instance.includes(".")) {
                    console.log("here2");
                    const newParams = new URLSearchParams();
                    newParams.set("instance", instance);
                    window.location.search = newParams.toString();
                  }
                }}
              >
                Search
              </button>
            </div>
            {
              // feel like i shouldn't have to do this........
              instanceData.thumbnail && (
                <img
                  src={instanceData.thumbnail.url}
                  alt="Instance header"
                  width="100%"
                  max-width="100%"
                  height="auto"
                  style={{
                    borderRadius: "1rem",
                  }}
                />
              )
            }
            <div style={{
              display: "flex",
              justifyContent: "space-between",
            }}>
              <div>
                <h2>{instanceData.title}</h2>
                <p>{instanceData.description}</p>
                <p>Users this month: {instanceData.usage.users.active_month}</p>
                <p>Accepting registrations: {instanceData.registrations.enabled ? <>✅</> : <>❌</>}{instanceData.registrations.approval_required ? <>(with approval)</> : null}</p>
              </div>
              <div>
                <h2>Contact</h2>
                <p>Admin: {instanceData.contact.account.url}</p>
                <p>Admin email: {instanceData.contact.email}</p>
                <p>{instanceData.contact.account.note.replace(/(<([^>]+)>)/gi, "")}</p>
              </div>
            </div>
            <hr
              style={{
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            />
            <div
              id="instance-details"
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  flexBasis: 0,
                  flexGrow: 1,
                }}
              >
                <h2>Rules</h2>
                <ul>
                  {instanceRuleData &&
                    instanceRuleData.map((rule) => (
                      <li key={rule.id}>{rule.text}</li>
                    ))}
                </ul>
              </div>

              <div
                style={{
                  flexBasis: 0,
                  flexGrow: 1,
                  paddingRight: "1rem",
                }}
              >
                <div
                  className="instance-detail"
                  style={{
                    display: "flex",
                  }}
                >
                  <h2>Peers ✅</h2>
                  {/* <p>{instancePeerData.length}</p> */}
                  {/* todo: disable next once on last page */}
                  <p
                    style={{
                      alignSelf: "center",
                      marginLeft: "auto",
                    }}
                  >
                    Page: {peerPage / 10 + 1} of{" "}
                    {Math.ceil(instancePeerData.length / 10)}
                  </p>
                </div>
                <div
                  className="page-ctrl-group"
                  style={{
                    display: "flex",
                  }}
                >
                  <input
                    type="text"
                    placeholder="search"
                    onChange={(event) => {
                      const newPeers = instancePeerData.filter((peer) => {
                        return peer.includes(event.target.value);
                      });
                      setShownPeers(newPeers.slice(peerPage, peerPage + 10));
                    }}
                  />
                  <div
                    className="page-btn-group"
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <button
                      style={{
                        marginRight: "0.25rem",
                      }}
                      onClick={() => setPeerPage(peerPage - 10)}
                      disabled={!peerPage}
                    >
                      &lt; Prev
                    </button>
                    <button onClick={() => setPeerPage(peerPage + 10)}>
                      Next &gt;
                    </button>
                  </div>
                </div>
                <ul>
                  {shownPeers.map((peer, i) => (
                    <li
                      style={{
                        cursor: "pointer",
                      }}
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

              <div
                style={{
                  flexBasis: 0,
                  flexGrow: 1,
                }}
              >
                <div
                  className="instance-detail"
                  style={{
                    display: "flex",
                  }}
                >
                  <h2>Blocked instances ❌</h2>
                  <p
                    style={{
                      alignSelf: "center",
                      marginLeft: "auto",
                    }}
                  >
                    Page: {blockPage / 10 + 1} of{" "}
                    {Math.ceil(instanceBlocksData.length / 10)}
                  </p>
                </div>
                <div
                  className="page-ctrl-group"
                  style={{
                    display: "flex",
                  }}
                >
                  {/* todo: disable next once on last page */}
                  <input
                    style={{
                      marginRight: "auto",
                    }}
                    type="text"
                    placeholder="search"
                    onChange={(event) => {
                      const newBlocks = instanceBlocksData.filter((block) => {
                        return block.domain.includes(event.target.value);
                      });
                      setShownBlocks(
                        newBlocks.slice(blockPage, blockPage + 10)
                      );
                    }}
                  />
                  <div
                    className="page-btn-group"
                    style={{
                      marginLeft: "auto",
                    }}
                  >
                    <button
                      style={{
                        marginRight: "0.25rem",
                      }}
                      onClick={() => setBlockPage(peerPage - 10)}
                      disabled={!blockPage}
                    >
                      &lt; Prev
                    </button>
                    <button onClick={() => setBlockPage(peerPage + 10)}>
                      Next &gt;
                    </button>
                  </div>
                </div>
                <ul>
                  {shownBlocks.map((block, i) => (
                    <li
                      style={{
                        cursor: "pointer",
                      }}
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
    </>
  );
}
