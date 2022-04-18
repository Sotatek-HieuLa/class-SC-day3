import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SotatekNFT } from "../typechain/SotatekNFT";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SotatekMarketPlace2 } from "../typechain/SotatekMarketPlace2";

describe("Market place version 2", function () {
  let Market;
  let market: SotatekMarketPlace2;

  let NFT;
  let nft: SotatekNFT;
  let signerAddress: string;
  let signerAddress2: SignerWithAddress;

  this.beforeEach(async () => {
    NFT = await ethers.getContractFactory("SotatekNFT");
    nft = await NFT.deploy();
    nft.deployed();

    Market = await ethers.getContractFactory("SotatekMarketPlace2");
    market = await Market.deploy(nft.address);
    market.deployed();

    nft.setMarketplace(market.address);

    signerAddress = await (await ethers.getSigners())[0].getAddress();
    signerAddress2 = (await ethers.getSigners())[1];

    await nft.mint(signerAddress, "https://oke.com");
    await market.sellItem("0", ethers.utils.parseEther("1"));
  });

  it("Test sellItem", async function () {
    const items = await market.viewItem();
    expect(items[0].tokenId).to.equal(BigNumber.from("0"));
    expect(items.length).to.equal(1);
  });

  it("Test sellItem with item are on sale", async function () {
    await expect(
      market.sellItem("0", ethers.utils.parseEther("1"))
    ).to.be.revertedWith("This NFT token has been sold");
  });

  it("Test sellItem do not own", async function () {
    await expect(
      market.connect(signerAddress2).sellItem("0", ethers.utils.parseEther("1"))
    ).to.be.revertedWith("Sender does not own the item");
  });

  it("Test changePrice", async function () {
    const oldItems = await market.viewItem();
    expect(oldItems[0].tokenId).to.equal(BigNumber.from("0"));
    expect(oldItems[0].price).to.equal(ethers.utils.parseEther("1"));
    expect(oldItems.length).to.equal(1);

    await market.changePriceItem(
      BigNumber.from("0"),
      ethers.utils.parseEther("1.5")
    );
    const newItems = await market.viewItem();
    expect(newItems[0].tokenId).to.equal(BigNumber.from("0"));
    expect(newItems[0].price).to.equal(ethers.utils.parseEther("1.5"));
    expect(newItems.length).to.equal(1);
  });

  it("Test changePrice with item has not open sell", async function () {
    await market.connect(signerAddress2).buyItem(BigNumber.from("0"), {
      value: ethers.utils.parseEther("1.0025"),
    });

    await expect(
      market.changePriceItem(
        BigNumber.from("0"),
        ethers.utils.parseEther("1.5")
      )
    ).to.be.revertedWith("This requested item must be on sale");
  });

  it("Test changePrice with item of another address", async function () {
    const oldItems = await market.viewItem();
    expect(oldItems[0].tokenId).to.equal(BigNumber.from("0"));
    expect(oldItems[0].price).to.equal(ethers.utils.parseEther("1"));
    expect(oldItems.length).to.equal(1);

    await expect(
      market
        .connect(signerAddress2)
        .changePriceItem(BigNumber.from("0"), ethers.utils.parseEther("1.5"))
    ).to.be.revertedWith(
      "This action requires you to be the seller of this item"
    );
    const newItems = await market.viewItem();
    expect(newItems[0].price).to.equal(ethers.utils.parseEther("1"));
  });

  it("Test buy item", async function () {
    const oldBalanceBuyer = await signerAddress2.getBalance();
    const oldBalanceSeller = await await (
      await ethers.getSigners()
    )[0].getBalance();

    await market.connect(signerAddress2).buyItem(BigNumber.from("0"), {
      value: ethers.utils.parseEther("1.0025"),
    });

    expect(
      (await (await ethers.getSigners())[0].getBalance()).sub(oldBalanceSeller)
    ).to.equal(ethers.utils.parseEther("0.9975"));

    expect(oldBalanceBuyer.sub(await signerAddress2.getBalance())).to.gte(
      ethers.utils.parseEther("0.9975")
    );

    expect(await nft.ownerOf(BigNumber.from("0"))).to.equal(
      await signerAddress2.getAddress()
    );
  });

  it("Test buy item not open for sale", async function () {
    await market.connect(signerAddress2).buyItem(BigNumber.from("0"), {
      value: ethers.utils.parseEther("1.0025"),
    });

    await expect(
      market
        .connect(signerAddress2)
        .buyItem(BigNumber.from("0"), { value: ethers.utils.parseEther("1") })
    ).to.be.revertedWith("This requested item must be on sale");
  });

  it("Test buy own items", async function () {
    await expect(
      market.buyItem(BigNumber.from("0"), {
        value: ethers.utils.parseEther("1"),
      })
    ).to.be.revertedWith(
      "This action requires that you are not the seller of this item"
    );
  });

  it("Test buy item not enough funds sent", async function () {
    await expect(
      market.connect(signerAddress2).buyItem(BigNumber.from("0"), {
        value: ethers.utils.parseEther("0.1"),
      })
    ).to.be.revertedWith("Not enough funds sent");
  });

  it("Test get / set treasury address", async function () {
    expect(await market.getTreasuryAddress()).to.equal(
      ethers.constants.AddressZero
    );

    await market.setTreasuryAddress(await signerAddress2.getAddress());

    expect(await market.getTreasuryAddress()).to.equal(
      await signerAddress2.getAddress()
    );
  });

  it("Test set treasury address with another address", async function () {
    await expect(
      market
        .connect(signerAddress2)
        .setTreasuryAddress(await signerAddress2.getAddress())
    ).to.revertedWith("Ownable: caller is not the owner");
  });
});
