import { BigNumber } from "ethers";
const { ethers, upgrades } = require("hardhat");

const proxyAddress = "0xEAc3F860ab7eab170688058530BBDC9a197a4710";
const nftAddress = "0x11af09b4CB6d18bb97bC4A74D13Ca609560785E6";

async function main() {
  const Market2 = await ethers.getContractFactory("SotatekMarketPlace2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, Market2, [
    nftAddress,
    BigNumber.from("0"),
  ]);
  await upgraded.deployed();

  console.log("instance deployed to:", upgraded.address);

  upgraded.setTreasuryAddress("0x67AaCca69919E9804e6Ab19ed7D0d099EF4E0e99");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
