import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { WalletSidebar, WalletToolbarButton } from "./WalletSidebar";
import { ReactComponent as SidebarWallet } from "../icons/SidebarWallet.svg";
import gsptokenabi from "./gsptokenABI";
import "./WalletSidebar.css";
("./gsptokenABI");

export function WalletSidebarContainer({
  onClose,
  globalWalletState,
  updateGlobalWalletState,
  accountData,
  setAccountData
}) {
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
    bottomMessageText: ""
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
            let obj = {
              balance: window.Web3.utils.fromWei(res.toString())
            };
            updateGlobalWalletState(true, obj);
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
    console.log("wETH", window.ethereum, account);
    // if (window.ethereum) {
    //   console.log("inside we");
    //   window.ethereum
    //     .request({ method: "eth_requestAccounts" })
    //     .then((res, err) => {
    //       if (res) {
    //         console.log("response", res);
    //       }
    //     })
    //     .catch(error => {
    //       if (error.code === 4001) {
    //         // EIP-1193 userRejectedRequest error
    //         console.log("Please connect to MetaMask.");
    //       } else {
    //         console.error(error);
    //       }
    //     });
    // }
    window.ethereum.enable().then(accounts => {
      console.log("esr", account);
      let userAccount = accounts[0];
      //web3.eth.defaultAccount = account;
      console.log(userAccount, "chain", window.ethereum.chainId);
      if (window.ethereum.chainId === "0x13881") {
        fetchBalance(userAccount);
      } else {
        switchNetworkMumbai(window.ethereum, userAccount);
      }
      setAccount(prevState => {
        return {
          ...prevState,
          account: userAccount
        };
      });
      updateGlobalWalletState(true, userAccount);
      setAccountData(true, userAccount);
      // setAccount({
      //   account: userAccount
      // });
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

  useEffect(() => {
    try {
      console.log("USERACC", accountData);
    } catch (error) {
      console.error("Error while connecting the Wallet", error);
    }
  }, []);

  return (
    <WalletSidebar onClose={onClose}>
      <div className={walletState.walletState ? "cus-modal" : "cus-modal"}>
        {accountData.account !== null ? (
          <>
            {walletState.walletState === true ? (
              <div>
                <p className="heading-one">Your Wallet</p>
                <p className="wallet-address">{accountData.account}</p>
                <div className="gspcoin-container">
                  <img
                    className="gspcoin-image"
                    src={"https://sonarkelaone-assets-6c7d3550.s3.amazonaws.com/hubs/assets/images/sonarkela_coin.png"}
                  />
                </div>
                <div className="balance-container">
                  <p className="balance-text">Balance</p>
                  <p className="balance">{account.balance}</p>
                  <p className="gsp-text">SNK</p>
                </div>
                <div className="balance-container transfer-container">
                  <p className="gsp-text transfer-heading">Send Tokens</p>
                  <input
                    className="transfer-input token-amount"
                    placeholder="Enter Amount"
                    type="text"
                    onInput={e => inputhandler(e, "sendtokens")}
                    value={account.sendtokens}
                  />
                  <input
                    className="transfer-input"
                    type="text"
                    placeholder="Enter Address"
                    onInput={e => inputhandler(e, "sendaddress")}
                    value={account.sendaddress}
                  />
                  {account.timerMessage ? (
                    <>
                      <p className="gsp-text transfer-heading transfer-message">{account.timerMessageText}</p>
                    </>
                  ) : (
                    <>
                      {account.buttonState ? (
                        <>
                          <p className="gsp-text transfer-heading transfer-message">
                            Transfer in progress. Please wait...
                          </p>
                        </>
                      ) : (
                        <button
                          className="send-button"
                          disabled={account.buttonState}
                          onClick={() => {
                            console.log("send tokens", account.sendtokens, account.sendaddress);
                            transferToken(account.sendtokens, account.sendaddress);
                          }}
                        >
                          Send
                        </button>
                      )}
                    </>
                  )}
                  {account.bottomMessage ? (
                    <>
                      {account.buttonState ? (
                        <p className="gsp-text transfer-heading transfer-message-new" />
                      ) : (
                        <p className="gsp-text transfer-heading transfer-message-new">{account.bottomMessageText}</p>
                      )}
                    </>
                  ) : (
                    <p className="gsp-text transfer-heading transfer-message-new" />
                  )}
                </div>
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
    </WalletSidebar>
  );
}

WalletSidebarContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  globalWalletState: PropTypes.object.isRequired,
  updateGlobalWalletState: PropTypes.func.isRequired,
  accountData: PropTypes.object.isRequired,
  setAccountData: PropTypes.func.isRequired
};

export function WalletToolbarButtonContainer(props) {
  //const { unreadMessages } = useContext(ChatContext);
  return <WalletToolbarButton {...props} />;
}
