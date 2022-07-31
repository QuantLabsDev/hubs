import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { NFTSidebar, NFTToolbarButton } from "./NFTSidebar";
import { ReactComponent as SidebarWallet } from "../icons/SidebarWallet.svg";
import gsptokenabi from "./gsptokenABI";
import "./NFTSidebar.css";
("./gsptokenABI");

export function NFTSidebarContainer({ onClose, nftWalletState, updateNftWalletState, accountData, setAccountData }) {
  const options = {
    chain: "polygon",
    address: accountData.account
  };

  const [nftList, setNftList] = useState([]);

  const [walletState, setWalletState] = useState({
    walletState: true
  });

  const [account, setAccount] = useState({
    account: null,
    balance: "0",
    sendtokens: 0,
    sendaddress: "0x0000",
    buttonState: false,
    timerMessage: false,
    timerMessageText: "",
    bottomMessage: false,
    bottomMessageText: "",
    nftArray: []
  });

  const walletModal = () => {
    setWalletState(prevState => {
      return {
        walletState: !prevState.walletState
      };
    });
  };

  const fetchBalance = address => {
    console.log("Fetching balance for ", address);
    let web3 = new window.Web3(window.ethereum);
    console.log("web3", web3);
    let abi = JSON.parse(gsptokenabi);
    console.log("abi", abi);
    let contract = new web3.eth.Contract(abi, "0x8EdaD794Be73971B9F0B08630b10d6831FCA89F2");
    console.log("contract", contract);
    try {
      contract.methods
        .balanceOf(address)
        .call({ from: address })
        .then((res, err) => {
          if (res) {
            console.log("Balance", res);
            setAccount(prevState => {
              return {
                ...prevState,
                balance: window.Web3.utils.fromWei(res.toString())
              };
            });
          } else {
            console.log("Error while fetching Balance", err);
          }
        });
    } catch (error) {
      console.log("Metamask Error while fetching Balance", error);
    }
  };

  const delayedBalanceChecker = () => {
    fetchBalance(account.account);
    // setTimeout(() => {
    //   fetchBalance(account.account);
    // }, 6000);
  };

  const timerFunction = () => {
    setTimeout(() => {
      delayedBalanceChecker();
      // setAccount(prevState => {
      //   return {
      //     ...prevState,
      //     timerMessage: false
      //   };
      // });
    }, 6000);
  };

  const transferToken = (tokens, address) => {
    console.log("Params", tokens, address);
    setAccount(prevState => {
      return {
        ...prevState,
        buttonState: true
      };
    });
    if (account.sendtokens > 0) {
      if (window.Web3.utils.isAddress(account.sendaddress)) {
        console.log(
          "comp",
          account.sendtokens,
          account.balance,
          parseInt(account.sendtokens),
          parseInt(account.balance)
        );
        if (parseInt(account.sendtokens) <= parseInt(account.balance)) {
          let web3 = new window.Web3(window.ethereum);
          console.log("web3", web3);
          let abi = JSON.parse(gsptokenabi);
          console.log("abi", abi);
          let contract = new web3.eth.Contract(abi, "0x8EdaD794Be73971B9F0B08630b10d6831FCA89F2");
          console.log("contract", contract);
          contract.methods
            .transfer(account.sendaddress, window.Web3.utils.toWei(account.sendtokens.toString()))
            .send({ from: account.account })
            .then((res, err) => {
              if (res) {
                console.log("Token Transfer", res);
                setAccount(prevState => {
                  return {
                    ...prevState,
                    buttonState: false,
                    sendaddress: "",
                    sendtokens: "",
                    timerMessage: false,
                    bottomMessage: true,
                    bottomMessageText: "Transaction Successful"
                  };
                });
                timerFunction();
              } else {
                console.error("Error while transfering the tokens", err);
                setAccount(prevState => {
                  return {
                    ...prevState,
                    buttonState: false,
                    sendaddress: "",
                    sendtokens: "",
                    timerMessage: false,
                    bottomMessage: true,
                    bottomMessageText: "Transaction Failed"
                  };
                });
                timerFunction();
              }
            })
            .catch(err => {
              console.log("User Rejected Txn", err);
              setAccount(prevState => {
                return {
                  ...prevState,
                  buttonState: false,
                  timerMessage: false,
                  bottomMessage: true,
                  bottomMessageText: "Transaction Rejected"
                };
              });
            });
        } else {
          //alert("Insufficient Balance");
          setAccount(prevState => {
            return {
              ...prevState,
              buttonState: false,
              timerMessage: false,
              bottomMessage: true,
              bottomMessageText: "Insufficient Balance"
            };
          });
          timerFunction();
        }
      } else {
        //alert("Invalid Address");
        setAccount(prevState => {
          return {
            ...prevState,
            buttonState: false,
            timerMessage: false,
            timerMessageText: "Invalid Address",
            bottomMessageText: "Invalid Address",
            bottomMessage: true
          };
        });
        timerFunction();
      }
    } else {
      //alert("Minimum token amount to transfer should be 1 GSP");
      setAccount(prevState => {
        return {
          ...prevState,
          buttonState: false,
          bottomMessageText: "Minimum token amount to transfer should be 1 GSP",
          bottomMessage: true
        };
      });
    }
  };

  const connectWallet = () => {
    console.log("wETH", window.ethereum);
    window.ethereum.enable().then(accounts => {
      let userAccount = accounts[0];
      //web3.eth.defaultAccount = account;
      console.log(userAccount, "chain", window.ethereum.chainId);
      if (window.ethereum.chainId === "0x13881") {
        fetchBalance(userAccount);
      } else {
        switchNetworkMumbai(window.ethereum, userAccount);
      }
      setAccount({
        account: userAccount
      });
      setAccountData(true, userAccount);
    });
  };

  const switchNetworkMumbai = async (ethereum, userAddress) => {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA869" }]
      });
      fetchBalance(userAddress);
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13881",
                chainName: "Polygon Mumbai Testnet",
                rpcUrls: ["https://rpc-mumbai.maticvigil.com/"]
              }
            ]
          });
          fetchBalance(userAddress);
        } catch (addError) {
          console.error("Error while adding new chain to MetaMask");
        }
      }
      // handle other "switch" errors
    }
  };

  const inputhandler = (e, params) => {
    console.log(e.currentTarget.value, params, account);
    let value = e.currentTarget.value;
    console.log(value);
    setAccount(prevState => {
      return {
        ...prevState,
        [params]: value
      };
    });
  };

  const getNFTBalancesFunc = async () => {
    console.log("call gnb :>> ", accountData.account);
    const localoptions = {
      chain: "polygon",
      address: accountData.account
      //address: "0x6297190b18df7c6ad1979c59816c27396b934e63"
    };
    const polygonNFTs = await window.Moralis.Web3API.account.getNFTs(localoptions).catch(err => {
      console.log("Moralis Error", err);
    });
    let counter = 0;
    let imgArray = [];
    console.log("opl", polygonNFTs.result);
    await polygonNFTs.result.forEach(async nft => {
      console.log("counter", counter, nft.token_uri);
      let url = fixURL(nft.token_uri);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          console.log("imgdata", data);
          let ele = (
            <div className="nft-subcontainer">
              <img className="nft-image" src={data.image} />
              <p className="nft-name">{data.name.slice(0, 8) + ".."}</p>
            </div>
          );
          console.log("ifele", ele, checkImage(data.image));
          checkImage(data.image, ele);
        });
    });
    console.log("bal", polygonNFTs, imgArray);
  };

  function checkImage(url, ele) {
    let request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.send();
    request.onload = function() {
      //status = request.status;
      if (request.status == 200) {
        //if(statusText == OK)
        console.log("image exists");
        let tempArray = nftList;
        tempArray.push(ele);
        setNftList(tempArray);
        updateNftWalletState(true, tempArray);
        return true;
      } else {
        console.log("image doesn't exist");
        return false;
      }
    };
  }

  function fixURL(url) {
    if (url.startsWith("ipfs")) {
      return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://ipfs/").slice(-1)[0];
    } else {
      return url + "?format=json";
    }
  }
  function fixURL2(url) {
    if (url.startsWith("ipfs")) {
      return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)[0];
    }
  }

  useEffect(() => {
    try {
      if (!nftWalletState.status && accountData.account !== null) getNFTBalancesFunc();
    } catch (error) {
      console.error("Error while connecting the Wallet", error);
    }
  }, []);

  useEffect(
    () => {
      console.log("UEAD", accountData);
      if (accountData.account !== null && !nftWalletState.status) getNFTBalancesFunc();
    },
    [accountData]
  );

  return (
    <NFTSidebar onClose={onClose}>
      <div className={walletState.walletState ? "cus-modal" : "cus-modal"}>
        {accountData.account !== null ? (
          <>
            {walletState.walletState === true ? (
              <div>
                <p className="heading-one">NFT Wallet</p>
                {nftWalletState.array.length > 0 ? (
                  <div className="nft-container">{nftWalletState.array}</div>
                ) : (
                  <p className="no-nft-message">No NFTs Found</p>
                )}
              </div>
            ) : (
              <button className="wallet-icon-container" onClick={() => walletModal()}>
                <SidebarWallet className="wallet-icon" />
              </button>
            )}
          </>
        ) : (
          <>
            {walletState.walletState === true ? (
              <div className="wallet-not-connected-container">
                {window.ethereum === undefined ? (
                  <>
                    <button className="heading-one metamask-button" onClick={() => connectWallet()}>
                      <a href="https://metamask.io" target="_blank" className="metamask-link">
                        Install Metamask
                      </a>
                    </button>
                  </>
                ) : (
                  <button
                    className="heading-one no-border"
                    onClick={() => {
                      try {
                        connectWallet();
                      } catch (error) {
                        console.error("Error while connecting the Wallet");
                      }
                    }}
                  >
                    Connect Wallet
                  </button>
                )}
                <p className="wallet-message">Please connect your wallet</p>
                {/* <button className="close-button" onClick={() => walletModal()}>
                  Close
                </button> */}
              </div>
            ) : (
              <button className="wallet-icon-container" onClick={() => walletModal()}>
                <SidebarWallet className="wallet-icon" />
              </button>
            )}
          </>
        )}
      </div>
    </NFTSidebar>
  );
}

NFTSidebarContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  nftWalletState: PropTypes.object.isRequired,
  updateNftWalletState: PropTypes.func.isRequired,
  accountData: PropTypes.object.isRequired,
  setAccountData: PropTypes.func.isRequired
};

export function NFTToolbarButtonContainer(props) {
  //const { unreadMessages } = useContext(ChatContext);
  return <NFTToolbarButton {...props} />;
}
