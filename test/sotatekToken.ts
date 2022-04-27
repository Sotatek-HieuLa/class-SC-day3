import { SotatekToken } from "./../typechain/SotatekToken.d";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SotatekToken__factory } from "../typechain/factories/SotatekToken__factory";

describe("SotatekToken unit test", function () {
  let SotatekToken: SotatekToken__factory;
  let sotatekToken: SotatekToken;
  let signers: SignerWithAddress[];

  const testingAddress = "0x67AaCca69919E9804e6Ab19ed7D0d099EF4E0e99";

  this.beforeEach(async () => {
    SotatekToken = await ethers.getContractFactory("SotatekToken");
    sotatekToken = await SotatekToken.deploy("10000000000000000000");
    sotatekToken.deployed();

    signers = await ethers.getSigners();
  });

  it("Should return balance of owner equal initSupply", async function () {
    expect(await sotatekToken.balanceOf(await sotatekToken.owner())).to.equal(
      BigNumber.from("10000000000000000000")
    );
  });

  it("Balance of testing address increase 100% of total amount transfers", async () => {
    const oldBalance = await sotatekToken.balanceOf(testingAddress);

    await sotatekToken.transfer(testingAddress, ethers.utils.parseEther("1"));

    const newBalance = await sotatekToken.balanceOf(testingAddress);

    expect(
      newBalance
        .sub(oldBalance)
        .mul(BigNumber.from("100"))
        .div(ethers.utils.parseEther("1"))
    ).to.equal(BigNumber.from("100"));
  });
});
