// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const TokenERC = await ethers.getContractFactory("SotatekNFT");
  const token = await TokenERC.deploy();

  await token.deployed();

  console.log("NFT token deployed to:", token.address);

  const Market1 = await ethers.getContractFactory("SotatekMarketPlace");
  const proxy = await upgrades.deployProxy(Market1, [
    token.address,
    BigNumber.from("0"),
  ]);

  await proxy.deployed();

  await token.setMarketplace(proxy.address);

  console.log(await token.getMarketplace());
  console.log(proxy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
