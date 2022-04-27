import { SotatekToken } from "./../typechain/SotatekToken.d";
import { SotatekStaking } from "./../typechain/SotatekStaking.d";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SotatekNFT } from "../typechain/SotatekNFT";

describe("Staking", function () {
  let Staking;
  let NFT;
  let Token;
  let staking: SotatekStaking;
  let nft: SotatekNFT;
  let token: SotatekToken;
  let signerAddress: string;
  const testingAddress = "0x67AaCca69919E9804e6Ab19ed7D0d099EF4E0e99";

  this.beforeEach(async () => {
    signerAddress = await (await ethers.getSigners())[0].getAddress();

    NFT = await ethers.getContractFactory("SotatekNFT");
    nft = await NFT.deploy();
    nft.deployed();

    Token = await ethers.getContractFactory("SotatekToken");
    token = await Token.deploy(0);
    token.deployed();

    Staking = await ethers.getContractFactory("SotatekStaking");
    staking = await Staking.deploy(nft.address, token.address);
    staking.deployed();

    await nft.mint(signerAddress, "https://sotatek.com/#");

    await token.transferOwnership(staking.address);
  });

  it("Test setHashrate / getHashrate function", async function () {
    await staking.setHashrate(0, 15);
    expect(await staking.getHashrate(0)).to.equal(15);
  });

  it("Test stake function", async function () {
    await nft.approve(staking.address, 0);
    expect(await staking.stake(0)).to.emit(staking, "Staked");
  });

  it("Test stake function with item not owner", async function () {
    await nft
      .connect((await ethers.getSigners())[1])
      .mint(await (await ethers.getSigners())[1].getAddress(), "abc.com");

    await expect(staking.stake(1)).to.revertedWith(
      "You must be the owner of the nft token to perform this action"
    );
  });

  it("Test multiStake function", async function () {
    await nft.mint(signerAddress, "https://sotatek.com/2");

    await nft.approve(staking.address, 0);
    await nft.approve(staking.address, 1);

    await expect(staking.multiStake([0, 1])).to.emit(staking, "Staked");
  });

  it("Test multiStake function with item not owner", async function () {
    await nft
      .connect((await ethers.getSigners())[1])
      .mint(await (await ethers.getSigners())[1].getAddress(), "abc.com");

    await nft.approve(staking.address, 0);
    await nft
      .connect((await ethers.getSigners())[1])
      .approve(staking.address, 1);

    await expect(staking.multiStake([0, 1]))
      .to.emit(staking, "Staked")
      .revertedWith(
        "You must be the owner of the nft token to perform this action"
      );
  });

  it("Test unStake function", async function () {
    await nft.approve(staking.address, 0);
    await staking.stake(0);
    await expect(staking.unStake(0)).to.emit(staking, "Unstaked");
  });

  it("Test unStake function with item not owner", async function () {
    await nft
      .connect((await ethers.getSigners())[1])
      .mint(await (await ethers.getSigners())[1].getAddress(), "abc.com");

    await nft
      .connect((await ethers.getSigners())[1])
      .approve(staking.address, 1);
    await staking.connect((await ethers.getSigners())[1]).stake(1);
    await expect(staking.unStake(1)).to.revertedWith(
      "You must be the owner of the nft token to perform this action"
    );
  });

  it("Test multiUnStake function", async function () {
    await nft.mint(signerAddress, "https://sotatek.com/2");

    await nft.approve(staking.address, 0);
    await nft.approve(staking.address, 1);

    await staking.multiStake([0, 1]);

    await expect(staking.multiUnStake([0, 1]))
      .to.emit(staking, "Unstaked")
      .withArgs(signerAddress, 0)
      .emit(staking, "Unstaked")
      .withArgs(signerAddress, 1);
  });
});
