import { BigNumber } from "ethers";
import { SotatekNFT } from "../typechain/SotatekNFT";

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Sotatek NFT ERC721", function () {
  let SotaNFT;
  let sotatekNFT: SotatekNFT;
  const testingAddress: string = "0x67AaCca69919E9804e6Ab19ed7D0d099EF4E0e99";
  let signers: SignerWithAddress[];

  this.beforeEach(async () => {
    SotaNFT = await ethers.getContractFactory("SotatekNFT");
    sotatekNFT = await SotaNFT.deploy();
    sotatekNFT.deployed();

    signers = await ethers.getSigners();

    await sotatekNFT.setMarketplace(testingAddress);
  });

  it("Test setMaketPlaceAddress / mint / burn NFT", async function () {
    expect(await sotatekNFT.getMarketplace()).to.equal(testingAddress);

    await sotatekNFT.mint(
      await signers[0].getAddress(),
      "http//ok)eoke.com/nft"
    );

    expect(await sotatekNFT.balanceOf(await signers[0].getAddress())).to.equal(
      BigNumber.from("1")
    );

    await sotatekNFT.burn(0);

    expect(await sotatekNFT.balanceOf(await signers[0].getAddress())).to.equal(
      BigNumber.from("0")
    );

    await expect(sotatekNFT.burn(2)).to.be.revertedWith(
      "You are not the owner of this token"
    );
  });
});
