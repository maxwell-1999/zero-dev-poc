import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  useContractRead,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import contractAbi from "../resources/contracts/polygon-mumbai/0x34bE7f35132E97915633BC1fc020364EA5134863.json";
import { Button, Anchor, Flex } from "@mantine/core";
import { Page } from "../Page";
import {
  usePrepareContractBatchWrite,
  useContractBatchWrite,
} from "@zerodev/wagmi";
const incrementAbi = [
  {
    inputs: [],
    name: "incrementCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newCount",
        type: "uint256",
      },
    ],
    name: "updateCount",
    type: "event",
  },
  {
    inputs: [],
    name: "count",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const nftAddress = "0x34bE7f35132E97915633BC1fc020364EA5134863";

const description = `With ZeroDev, you can execute multiple transactions as a single transaction, so you get to save on confirmation time and gas cost. It's also safer because these transactions either all execute or all revert, no in-between, which is a property known as "atomicity."

In this example, we will be sending two "Mint" transactions in one.`;

export function BatchExample() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [balanceChanging, setBalanceChanging] = useState(false);
  const counterAddress = "0x702991272Ac078BD26105c671821678544f6fA9b";

  const { config } = usePrepareContractBatchWrite({
    calls: [
      {
        address: counterAddress,
        abi: incrementAbi,
        functionName: "incrementCount",
        args: [],
      },
      {
        address: counterAddress,
        abi: incrementAbi,
        functionName: "incrementCount",
        args: [],
      },
    ],
    enabled: true,
  });

  const { sendUserOperation: batchMint, data } = useContractBatchWrite(config);

  useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data,
    onSuccess() {
      console.log("Transaction was successful.");
    },
  });

  const interval = useRef<any>();
  const handleClick = useCallback(() => {
    if (batchMint) {
      setBalanceChanging(true);
      batchMint();
      interval.current = setInterval(() => {
        // refetch();
      }, 1000);
      setTimeout(() => {
        if (interval.current) {
          clearInterval(interval.current);
        }
      }, 100000);
    }
  }, [batchMint]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  }, [interval]);

  const {
    data: count,
    isError,
    isLoading,
  } = useContractRead({
    address: counterAddress,
    abi: incrementAbi,
    functionName: "count",
    watch: true,
  });
  useEffect(() => {
    setBalanceChanging(false);
  }, [count]);

  return (
    <Page
      title={"Bundle Transactions"}
      description={description}
      docs={"https://docs.zerodev.app/use-wallets/batch-transactions"}
    >
      <Flex
        align={"center"}
        justify={"center"}
        mih={"100%"}
        direction={"column"}
        gap={"1rem"}
      >
        <strong style={{ fontSize: "1.5rem" }}>Counter Contract Count</strong>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: "medium",
            width: 100,
            height: 100,
            borderRadius: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >{`${count}`}</div>
        <Button loading={balanceChanging} size={"lg"} onClick={handleClick}>
          Increment twice (batched)
        </Button>
      </Flex>
    </Page>
  );
}
